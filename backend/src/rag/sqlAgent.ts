// SQL Agent: cau hoi tieng Viet cua can bo xa -> SQL SELECT -> chay -> stream tom tat
import { query } from '../repositories/db.js'
import { generate, generateStream } from './ollama.js'
import type { Response as ExpressRes } from 'express'

const DB_SCHEMA = `
-- Bảng thôn
CREATE TABLE thon (
  id SERIAL PRIMARY KEY,
  ten_thon VARCHAR(100),    -- VD: "Phú Hoà", "Thạch Nham Đông"
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

const BASE_RULES = `## Quy tắc QUAN TRỌNG:
1. CHỈ tạo câu SELECT. KHÔNG BAO GIỜ dùng INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE.
1b. CHỈ được dùng ĐÚNG 6 bảng trong schema: thon, nguoi_dung, ho_dan, dot_ke_khai, ke_khai_ho, ke_khai_thon. KHÔNG BAO GIỜ tự bịa tên bảng khác (VD: ho_gia_dinh, nhan_khau, cu_dan... đều SAI). "Hộ dân" = bảng ho_dan. "Tổng hộ dân" = COUNT từ ho_dan.
2. Luôn JOIN đúng quan hệ: ho_dan.thon_id = thon.id, ke_khai_ho.ho_dan_id = ho_dan.id, ke_khai_ho.dot_id = dot_ke_khai.id
3. Khi hỏi theo thôn, JOIN với bảng thon qua thon_id.
4. Khi tính tổng/trung bình, dùng SUM/AVG/COUNT với GROUP BY phù hợp.
5. LUÔN LUÔN lọc ho_dan.trang_thai = 'dang_cu_tru' khi truy vấn bảng ho_dan (kể cả COUNT, SUM, JOIN). Hộ 'da_roi' KHÔNG được tính.
6. Chỉ lấy đợt đang mở hoặc đã đóng (không lấy đợt 'huy'): dot_ke_khai.trang_thai != 'huy'
7. Khi hỏi "đợt mới nhất" hoặc không chỉ định đợt, dùng subquery: dot_id = (SELECT id FROM dot_ke_khai WHERE trang_thai != 'huy' ORDER BY nam DESC, quy DESC LIMIT 1). KHÔNG dùng ORDER BY + LIMIT trên query chính khi có SUM/COUNT.
8. ct03_ho_ngheo và ct04_ho_can_ngheo là 0 hoặc 1 (boolean), SUM để đếm tổng hộ nghèo/cận nghèo.
9. KHÔNG lọc theo ke_khai_ho.trang_thai trừ khi câu hỏi nêu rõ. Dữ liệu đã kê khai gồm nhiều trạng thái ('da_ke_khai','da_duyet','giu_nguyen'); nếu tự thêm điều kiện trang_thai='da_ke_khai' sẽ bỏ sót dữ liệu.
10. Trả về TỐI ĐA 50 dòng (LIMIT 50).
11. Dữ liệu ho_ten trong bảng nguoi_dung được lưu KHÔNG DẤU (VD: "Le Van An", không phải "Lê Văn An"). Khi tìm theo tên, LUÔN dùng ILIKE với % để tìm gần đúng. VD: WHERE LOWER(nguoi_dung.ho_ten) ILIKE '%le van an%'. KHÔNG BAO GIỜ dùng dấu tiếng Việt trong điều kiện tìm tên.
12. MỘT HỘ CÓ THỂ CÓ NHIỀU BẢN KÊ KHAI (phien_ban 1, 2, 3...) trong cùng 1 đợt (khi bị trả lại và kê khai lại). Khi tính SUM/COUNT các chỉ tiêu (ct02-ct11) trên ke_khai_ho, LUÔN lọc ke_khai_ho.trang_thai = 'da_duyet' để chỉ lấy bản đã được xã duyệt. Bản bị trả lại ('tra_lai') hoặc chưa duyệt KHÔNG được tính vào số liệu tổng hợp. Nếu KHÔNG lọc sẽ đếm trùng dữ liệu.

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
Chỉ trả về câu SQL thuần, không có markdown, không có giải thích.`

function buildSystemPrompt(vaiTro: string, thonId?: number, hoDanId?: number, dotMoiNhatId?: number, tongHop?: any[]): string {
  const roleLabel: Record<string, string> = { xa: 'cán bộ xã', thon: 'cán bộ thôn', dan: 'người dân' }
  let prompt = `Bạn là trợ lý SQL cho hệ thống Ba Na SmartLink - hệ thống kê khai dữ liệu Văn hóa - Xã hội cấp xã.
Nhiệm vụ: Chuyển câu hỏi tiếng Việt của ${roleLabel[vaiTro] || 'người dùng'} thành câu truy vấn SQL PostgreSQL.

## Schema cơ sở dữ liệu:
${DB_SCHEMA}

${BASE_RULES}`

  if (vaiTro === 'thon' && thonId != null) {
    prompt += `

## PHÂN QUYỀN - CÁN BỘ THÔN (BẮT BUỘC):
Người hỏi là cán bộ thôn có thon_id = ${thonId}. BẮT BUỘC mọi câu SQL phải có điều kiện lọc theo thôn này.
- Nếu query bảng ho_dan: PHẢI có WHERE ho_dan.thon_id = ${thonId}
- Nếu query bảng ke_khai_ho qua ho_dan: PHẢI có WHERE h.thon_id = ${thonId} (với h là alias của ho_dan)
- Nếu query bảng ke_khai_thon: PHẢI có WHERE ke_khai_thon.thon_id = ${thonId}
- KHÔNG BAO GIỜ trả dữ liệu của thôn khác.`
  }

  if (vaiTro === 'dan' && hoDanId != null) {
    prompt += `

## PHÂN QUYỀN - NGƯỜI DÂN (BẮT BUỘC):
Người hỏi là người dân, hộ dân có ho_dan.id = ${hoDanId}. BẮT BUỘC mọi câu SQL phải lọc chỉ dữ liệu hộ này.
- Nếu query bảng ke_khai_ho: PHẢI có WHERE ke_khai_ho.ho_dan_id = ${hoDanId}
- Nếu query bảng ho_dan: PHẢI có WHERE ho_dan.id = ${hoDanId}
- KHÔNG BAO GIỜ trả dữ liệu của hộ dân khác.`
  }

  if (dotMoiNhatId != null) {
    prompt += `

## ĐỢT MỚI NHẤT CÓ DỮ LIỆU:
Đợt kê khai mới nhất có dữ liệu thực tế là dot_id = ${dotMoiNhatId}. Khi không chỉ định đợt cụ thể, LUÔN dùng dot_id = ${dotMoiNhatId} thay vì subquery.`
  }

  if (tongHop && tongHop.length > 0) {
    const filtered = vaiTro === 'thon' && thonId != null
      ? tongHop.filter((t: any) => t.thon_id === thonId)
      : tongHop
    if (filtered.length > 0) {
      prompt += `

## DỮ LIỆU TỔNG HỢP MỚI NHẤT (đã gộp từ nhiều đợt — NGUỒN CHÍNH XÁC NHẤT):
Dữ liệu bên dưới là tổng hợp chính xác nhất từ hệ thống (cùng nguồn với Dashboard).
**BẮT BUỘC**: Khi câu hỏi liên quan đến CT09 (gia đình văn hóa), CT12 (tổ CNSCĐ), CT13 (DVC trực tuyến), CT14 (bạo lực gia đình), hoặc bất kỳ số liệu tổng hợp nào có trong dữ liệu này — PHẢI lấy giá trị từ đây. Tạo SQL dạng: SELECT <giá trị> AS ket_qua
Các field: ct09_gia_dinh_van_hoa, ct12_thanh_vien_to_cnsc, ct13_huong_dan_dvc, ct14_bao_luc_gia_dinh, ct01_tong_ho, ct02_tong_nhan_khau, ct03_ho_ngheo, ct04_ho_can_ngheo, ct05_nguoi_co_cong, ct06_bao_tro_xh, ct07_tre_duoi_16, ct08_tre_hoan_canh, ct10_tuoi_lao_dong, ct11_tham_gia_bhyt.
${JSON.stringify(filtered)}`
    }
  }

  return prompt
}

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
  sql = injectHoDanFilter(sql)
  return sql
}

function injectHoDanFilter(sql: string): string {
  const upper = sql.toUpperCase()
  if (!upper.includes('HO_DAN')) return sql
  if (upper.includes("DANG_CU_TRU")) return sql
  if (/\bWHERE\b/i.test(sql)) {
    return sql.replace(/\bWHERE\b/i, "WHERE ho_dan.trang_thai = 'dang_cu_tru' AND")
  }
  const fromMatch = sql.match(/\bFROM\s+ho_dan\b/i)
  if (fromMatch) {
    const idx = fromMatch.index! + fromMatch[0].length
    return sql.slice(0, idx) + " WHERE ho_dan.trang_thai = 'dang_cu_tru'" + sql.slice(idx)
  }
  return sql
}

export interface AskDataResult {
  answer: string
  sql?: string
  data?: any[]
}

function buildSummarizePrompt(question: string, rows: any[], lichSu: string, vaiTro: string): string {
  const roleLabel: Record<string, string> = { xa: 'cán bộ xã', thon: 'cán bộ thôn', dan: 'người dân' }
  return `Bạn là trợ lý AI SmartLink cho ${roleLabel[vaiTro] || 'người dùng'}.

## QUY TẮC BẮT BUỘC:
1. CHỈ sử dụng dữ liệu trong phần "Kết quả dữ liệu" bên dưới. Được phép tính toán, so sánh, phân tích DỰA TRÊN dữ liệu này.
2. TUYỆT ĐỐI KHÔNG bịa thêm số liệu, thông tin hay dữ liệu KHÔNG CÓ trong kết quả.
3. Nếu có nhiều dòng, trình bày dạng danh sách. Ghi rõ đơn vị (hộ, người, vụ...).
4. Không nói về SQL hay kỹ thuật. Ngắn gọn, đúng trọng tâm.
${lichSu ? `\n## Lịch sử trò chuyện gần đây:\n${lichSu}\n` : ''}
## Câu hỏi ban đầu:
${question}

## Kết quả dữ liệu:
${JSON.stringify(rows, null, 2)}

## Trả lời:`
}

const REAL_TABLES = ['HO_DAN', 'NGUOI_DUNG', 'THON', 'KE_KHAI_HO', 'KE_KHAI_THON', 'DOT_KE_KHAI']

function hasRequiredFilter(sql: string, vaiTro: string, thonId?: number, hoDanId?: number): boolean {
  if (vaiTro === 'xa') return true
  const upper = sql.toUpperCase().replace(/\s+/g, ' ')
  const queriesToRealTable = REAL_TABLES.some(t => upper.includes(t))
  if (!queriesToRealTable) return true
  if (vaiTro === 'thon' && thonId != null) {
    return upper.includes(`THON_ID = ${thonId}`)
  }
  if (vaiTro === 'dan' && hoDanId != null) {
    return upper.includes(`HO_DAN_ID = ${hoDanId}`) || upper.includes(`HO_DAN.ID = ${hoDanId}`)
  }
  return false
}

function buildLichSu(lichSu?: { role: string; content: string }[]): string {
  if (!lichSu || lichSu.length === 0) return ''
  return lichSu
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'Người hỏi' : 'Trợ lý'}: ${m.content}`)
    .join('\n')
}

export async function askDataStream(
  res: ExpressRes,
  question: string,
  vaiTro: string,
  userId?: number,
  thonId?: number,
  lichSu?: { role: string; content: string }[]
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const lsChuoi = buildLichSu(lichSu)

  let hoDanId: number | undefined
  if (vaiTro === 'dan' && userId) {
    const result = await query('SELECT id FROM ho_dan WHERE chu_ho_id = $1 LIMIT 1', [userId])
    hoDanId = result.rows[0]?.id
    if (!hoDanId) {
      res.write(`data: ${JSON.stringify({ token: 'Không tìm thấy thông tin hộ dân của bạn trong hệ thống.' })}\n\n`)
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
      return
    }
  }

  const roleLabel: Record<string, string> = { xa: 'cán bộ xã', thon: 'cán bộ thôn', dan: 'người dân' }
  console.log('[SQL Agent]', { question, vaiTro, userId, thonId, hoDanId })

  const dotResult = await query(`SELECT id FROM dot_ke_khai WHERE trang_thai != 'huy' ORDER BY nam DESC, quy DESC`)
  let dotMoiNhatId: number | undefined
  for (const dot of dotResult.rows) {
    const check = await query(
      `SELECT 1 FROM ke_khai_ho WHERE dot_id = $1 UNION ALL SELECT 1 FROM ke_khai_thon WHERE dot_id = $1 LIMIT 1`,
      [dot.id]
    )
    if (check.rows.length > 0) { dotMoiNhatId = dot.id; break }
  }

  const { tongHopMoiNhat } = await import('../services/keKhaiService.js')
  const tongHop = await tongHopMoiNhat()
  const systemPrompt = buildSystemPrompt(vaiTro, thonId, hoDanId, dotMoiNhatId, tongHop)

  let rawSql: string
  try {
    rawSql = await generate(`${systemPrompt}\n\n## Câu hỏi của ${roleLabel[vaiTro] || 'người dùng'}:\n${question}`)
  } catch (err: any) {
    console.error('[SQL Agent] Generate SQL error:', err.message)
    res.write(`data: ${JSON.stringify({ token: 'Hệ thống AI đang tạm ngưng. Vui lòng thử lại sau ít phút.', done: true })}\n\n`)
    res.end()
    return
  }

  console.log('[SQL Agent] generated SQL:', rawSql.slice(0, 200))
  const sql = cleanSQL(rawSql)

  if (!sql || !isSafeSQL(sql)) {
    res.write(`data: ${JSON.stringify({ token: 'Xin lỗi, tôi không thể tạo truy vấn phù hợp cho câu hỏi này. Bạn có thể diễn đạt lại không?' })}\n\n`)
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
    return
  }

  if (!hasRequiredFilter(sql, vaiTro, thonId, hoDanId)) {
    const fs = await import('fs')
    fs.appendFileSync('rag_debug.log', `[${new Date().toISOString()}] BLOCKED SQL: ${sql}\n`)
    console.warn('SQL missing required filter:', { vaiTro, thonId, hoDanId, sql })
    res.write(`data: ${JSON.stringify({ token: 'Xin lỗi, tôi không thể truy vấn dữ liệu ngoài phạm vi quyền hạn của bạn.' })}\n\n`)
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
    return
  }

  let rows: any[]
  let finalSql = sql
  try {
    const result = await query(finalSql)
    rows = result.rows
  } catch (err: any) {
    console.error('SQL execution error (attempt 1):', err.message, '\nSQL:', finalSql)
    try {
      const retryPrompt = `${systemPrompt}\n\n## Câu hỏi: ${question}\n\n## SQL trước đó bị lỗi:\n${finalSql}\n\n## Lỗi:\n${err.message}\n\nHãy sửa lại câu SQL cho đúng. CHỈ dùng tên bảng/cột CHÍNH XÁC trong schema.`
      const retryRaw = await generate(retryPrompt)
      const retrySql = cleanSQL(retryRaw)
      if (retrySql && isSafeSQL(retrySql) && hasRequiredFilter(retrySql, vaiTro, thonId, hoDanId)) {
        console.log('[SQL Agent] retry SQL:', retrySql.slice(0, 200))
        const retryResult = await query(retrySql)
        rows = retryResult.rows
        finalSql = retrySql
      } else {
        throw new Error('Retry SQL invalid')
      }
    } catch (retryErr: any) {
      console.error('SQL execution error (attempt 2):', retryErr.message)
      res.write(`data: ${JSON.stringify({ token: 'Xin lỗi, truy vấn dữ liệu gặp lỗi. Bạn có thể diễn đạt câu hỏi khác được không?' })}\n\n`)
      res.write(`data: ${JSON.stringify({ done: true, sql: finalSql })}\n\n`)
      res.end()
      return
    }
  }

  if (rows.length === 0) {
    res.write(`data: ${JSON.stringify({ token: 'Không tìm thấy dữ liệu phù hợp với câu hỏi của bạn. Có thể chưa có dữ liệu kê khai cho tiêu chí này.' })}\n\n`)
    res.write(`data: ${JSON.stringify({ done: true, sql: finalSql, data: [] })}\n\n`)
    res.end()
    return
  }

  const prompt = buildSummarizePrompt(question, rows, lsChuoi, vaiTro)

  let stream: NodeJS.ReadableStream
  try {
    stream = await generateStream(prompt)
  } catch (err: any) {
    console.error('[SQL Agent] Generate stream error:', err.message)
    res.write(`data: ${JSON.stringify({ token: 'Hệ thống AI đang tạm ngưng. Vui lòng thử lại sau ít phút.', done: true, sql: finalSql, data: rows })}\n\n`)
    res.end()
    return
  }

  let buffer = ''
  stream.on('data', (chunk: Buffer) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)
        if (json.response) {
          res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`)
        }
        if (json.done) {
          res.write(`data: ${JSON.stringify({ done: true, sql: finalSql, data: rows })}\n\n`)
          res.end()
        }
      } catch {}
    }
  })

  stream.on('end', () => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ done: true, sql: finalSql, data: rows })}\n\n`)
      res.end()
    }
  })

  stream.on('error', () => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ token: 'Không thể tóm tắt kết quả.', done: true, sql })}\n\n`)
      res.end()
    }
  })
}
