// SQL Agent: cau hoi tieng Viet cua can bo xa -> SQL SELECT -> chay -> qwen3 tom tat
import { query } from '../repositories/db.js'
import { generate } from './ollama.js'

const DB_SCHEMA = `
-- Bảng thôn
CREATE TABLE thon (
  id SERIAL PRIMARY KEY,
  ten_thon VARCHAR(100),    -- VD: "Thôn 1", "Thôn Phú Túc"
  ma_thon VARCHAR(20),
  trang_thai VARCHAR(20)    -- 'hoat_dong' | 'ngung_hoat_dong'
);

-- Bảng người dùng (dân, cán bộ thôn, cán bộ xã)
CREATE TABLE nguoi_dung (
  id SERIAL PRIMARY KEY,
  ho_ten VARCHAR(200),
  cccd VARCHAR(12),
  so_dien_thoai VARCHAR(15),
  vai_tro VARCHAR(20),      -- 'dan' | 'thon' | 'xa'
  thon_id INTEGER REFERENCES thon(id),
  trang_thai VARCHAR(20)    -- 'hoat_dong' | 'ngung_hoat_dong'
);

-- Bảng hộ dân
CREATE TABLE ho_dan (
  id SERIAL PRIMARY KEY,
  chu_ho_id INTEGER REFERENCES nguoi_dung(id),
  thon_id INTEGER REFERENCES thon(id),
  dia_chi VARCHAR(500),
  trang_thai VARCHAR(20)    -- 'dang_cu_tru' | 'da_roi'
);

-- Bảng đợt kê khai (mỗi quý hoặc đột xuất)
CREATE TABLE dot_ke_khai (
  id SERIAL PRIMARY KEY,
  ten_dot VARCHAR(200),
  loai VARCHAR(20),         -- 'dinh_ky' | 'dot_xuat'
  quy INTEGER,              -- 1-4
  nam INTEGER,
  ngay_bat_dau DATE,
  ngay_ket_thuc DATE,
  trang_thai VARCHAR(20)    -- 'dang_mo' | 'da_dong' | 'huy'
);

-- Bảng kê khai hộ (dân nhập các chỉ tiêu CT02-CT11)
CREATE TABLE ke_khai_ho (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER REFERENCES dot_ke_khai(id),
  ho_dan_id INTEGER REFERENCES ho_dan(id),
  phien_ban INTEGER DEFAULT 1,
  ct02_tong_nhan_khau INTEGER DEFAULT 0,   -- Tổng nhân khẩu
  ct03_ho_ngheo INTEGER DEFAULT 0,          -- Hộ nghèo (0 hoặc 1)
  ct04_ho_can_ngheo INTEGER DEFAULT 0,      -- Hộ cận nghèo (0 hoặc 1)
  ct05_nguoi_co_cong INTEGER DEFAULT 0,     -- Số người có công
  ct06_bao_tro_xh INTEGER DEFAULT 0,        -- Số người bảo trợ xã hội
  ct07_tre_duoi_16 INTEGER DEFAULT 0,       -- Số trẻ dưới 16 tuổi
  ct08_tre_hoan_canh INTEGER DEFAULT 0,     -- Số trẻ hoàn cảnh đặc biệt
  ct10_tuoi_lao_dong INTEGER DEFAULT 0,     -- Số người trong tuổi lao động
  ct11_tham_gia_bhyt INTEGER DEFAULT 0,     -- Số người tham gia BHYT
  trang_thai VARCHAR(30)    -- 'chua_ke_khai' | 'da_ke_khai' | 'da_duyet' | 'tra_lai' | 'giu_nguyen'
);

-- Bảng kê khai thôn (thôn nhập CT09, CT12-CT14)
CREATE TABLE ke_khai_thon (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER REFERENCES dot_ke_khai(id),
  thon_id INTEGER REFERENCES thon(id),
  ct09_gia_dinh_van_hoa INTEGER DEFAULT 0,      -- Số gia đình văn hóa
  ct12_thanh_vien_to_cnsc INTEGER DEFAULT 0,     -- Số thành viên Tổ CNSC
  ct13_huong_dan_dvc INTEGER DEFAULT 0,          -- Số người được hướng dẫn DVC
  ct14_bao_luc_gia_dinh INTEGER DEFAULT 0,       -- Số vụ bạo lực gia đình
  trang_thai VARCHAR(20)    -- 'chua_nhap' | 'da_nhap' | 'da_nop_xa'
);
`

const SYSTEM_PROMPT = `Bạn là trợ lý SQL cho hệ thống Ba Na SmartLink - hệ thống kê khai dữ liệu Văn hóa - Xã hội cấp xã.
Nhiệm vụ: Chuyển câu hỏi tiếng Việt của cán bộ xã thành câu truy vấn SQL PostgreSQL.

## Schema cơ sở dữ liệu:
${DB_SCHEMA}

## Quy tắc QUAN TRỌNG:
1. CHỈ tạo câu SELECT. KHÔNG BAO GIỜ dùng INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE.
2. Luôn JOIN đúng quan hệ: ho_dan.thon_id = thon.id, ke_khai_ho.ho_dan_id = ho_dan.id, ke_khai_ho.dot_id = dot_ke_khai.id
3. Khi hỏi theo thôn, JOIN với bảng thon qua thon_id.
4. Khi tính tổng/trung bình, dùng SUM/AVG/COUNT với GROUP BY phù hợp.
5. Chỉ lấy hộ đang cư trú: ho_dan.trang_thai = 'dang_cu_tru'
6. Chỉ lấy đợt đang mở hoặc đã đóng (không lấy đợt 'huy'): dot_ke_khai.trang_thai != 'huy'
7. Khi hỏi "đợt mới nhất" hoặc không chỉ định đợt, dùng đợt có id lớn nhất hoặc ORDER BY nam DESC, quy DESC LIMIT 1.
8. ct03_ho_ngheo và ct04_ho_can_ngheo là 0 hoặc 1 (boolean), SUM để đếm tổng hộ nghèo/cận nghèo.
9. KHÔNG lọc theo ke_khai_ho.trang_thai trừ khi câu hỏi nêu rõ. Dữ liệu đã kê khai gồm nhiều trạng thái ('da_ke_khai','da_duyet','giu_nguyen'); nếu tự thêm điều kiện trang_thai='da_ke_khai' sẽ bỏ sót dữ liệu.
10. Trả về TỐI ĐA 50 dòng (LIMIT 50).

## Ý nghĩa các chỉ tiêu:
- CT02: Tổng nhân khẩu trong hộ
- CT03: Hộ có phải hộ nghèo không (0/1)
- CT04: Hộ có phải hộ cận nghèo không (0/1)
- CT05: Số người có công cách mạng
- CT06: Số người hưởng bảo trợ xã hội
- CT07: Số trẻ em dưới 16 tuổi
- CT08: Số trẻ em hoàn cảnh đặc biệt
- CT09: Số gia đình văn hóa (do thôn nhập)
- CT10: Số người trong tuổi lao động
- CT11: Số người tham gia BHYT
- CT12: Số thành viên Tổ Công nghệ số cộng đồng (do thôn nhập)
- CT13: Số người được hướng dẫn dịch vụ công trực tuyến (do thôn nhập)
- CT14: Số vụ bạo lực gia đình (do thôn nhập)

## Format trả về:
Chỉ trả về câu SQL thuần, không có markdown, không có giải thích. Ví dụ:
SELECT t.ten_thon, SUM(k.ct02_tong_nhan_khau) AS tong_nhan_khau FROM ke_khai_ho k JOIN ho_dan h ON k.ho_dan_id = h.id JOIN thon t ON h.thon_id = t.id WHERE h.trang_thai = 'dang_cu_tru' GROUP BY t.ten_thon ORDER BY t.ten_thon LIMIT 50`

function isSafeSQL(sql: string): boolean {
  const upper = sql.toUpperCase().replace(/\s+/g, ' ')
  const forbidden = ['INSERT ', 'UPDATE ', 'DELETE ', 'DROP ', 'ALTER ', 'TRUNCATE ', 'CREATE ', 'GRANT ', 'REVOKE ', 'EXEC ', 'EXECUTE ', ';']
  for (const kw of forbidden) {
    if (upper.includes(kw)) return false
  }
  if (!upper.trimStart().startsWith('SELECT')) return false
  return true
}

function cleanSQL(raw: string): string {
  let sql = raw.trim()
  if (sql.startsWith('```sql')) sql = sql.slice(6)
  else if (sql.startsWith('```')) sql = sql.slice(3)
  if (sql.endsWith('```')) sql = sql.slice(0, -3)
  sql = sql.trim().replace(/;+$/, '').trim()
  return sql
}

export interface AskDataResult {
  answer: string
  sql?: string
  data?: any[]
}

export async function askData(question: string): Promise<AskDataResult> {
  const rawSql = await generate(`${SYSTEM_PROMPT}\n\n## Câu hỏi của cán bộ xã:\n${question}`)
  const sql = cleanSQL(rawSql)

  if (!sql || !isSafeSQL(sql)) {
    return {
      answer: 'Xin lỗi, tôi không thể tạo truy vấn phù hợp cho câu hỏi này. Bạn có thể diễn đạt lại không?',
    }
  }

  let rows: any[]
  try {
    const result = await query(sql)
    rows = result.rows
  } catch (err: any) {
    console.error('SQL execution error:', err.message, '\nSQL:', sql)
    return {
      answer: 'Xin lỗi, truy vấn dữ liệu gặp lỗi. Bạn có thể diễn đạt câu hỏi khác được không?',
      sql,
    }
  }

  if (rows.length === 0) {
    return {
      answer: 'Không tìm thấy dữ liệu phù hợp với câu hỏi của bạn. Có thể chưa có dữ liệu kê khai cho tiêu chí này.',
      sql,
      data: [],
    }
  }

  const summarizePrompt = `Bạn là trợ lý AI SmartLink cho cán bộ xã. Hãy tóm tắt kết quả truy vấn dữ liệu sau thành câu trả lời tiếng Việt dễ hiểu, rõ ràng.
Nếu có nhiều dòng, hãy trình bày dạng danh sách. Nếu có số liệu, hãy ghi rõ đơn vị (hộ, người, vụ...).
Không nói về SQL hay kỹ thuật. Chỉ trả lời như đang báo cáo số liệu cho cán bộ xã.

## Câu hỏi ban đầu:
${question}

## Kết quả dữ liệu:
${JSON.stringify(rows, null, 2)}

## Trả lời:`

  const answer = await generate(summarizePrompt) || 'Không thể tóm tắt kết quả.'
  return { answer, sql, data: rows }
}
