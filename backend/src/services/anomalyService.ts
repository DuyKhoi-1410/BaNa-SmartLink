import { query } from '../repositories/db.js'
import * as thongBaoRepo from '../repositories/thongBaoRepo.js'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import * as hoDanRepo from '../repositories/hoDanRepo.js'

interface CanhBao {
  loai: 'dot_bien' | 'outlier' | 'ty_le'
  chi_tieu: string
  mo_ta: string
  gia_tri_moi: number
  gia_tri_cu?: number | null
  trung_binh_thon?: number | null
}

const CT_FIELDS = [
  { field: 'ct02_tong_nhan_khau', ten: 'Tổng nhân khẩu' },
  { field: 'ct03_ho_ngheo', ten: 'Hộ nghèo' },
  { field: 'ct04_ho_can_ngheo', ten: 'Hộ cận nghèo' },
  { field: 'ct05_nguoi_co_cong', ten: 'Người có công' },
  { field: 'ct06_bao_tro_xh', ten: 'Bảo trợ XH' },
  { field: 'ct07_tre_duoi_16', ten: 'Trẻ em dưới 16' },
  { field: 'ct08_tre_hoan_canh', ten: 'Trẻ em HCĐB' },
  { field: 'ct10_tuoi_lao_dong', ten: 'Tuổi lao động' },
  { field: 'ct11_tham_gia_bhyt', ten: 'Tham gia BHYT' },
]

// === 1. So sánh với đợt trước — phát hiện biến động đột biến ===
function kiemTraDotBien(keKhaiMoi: any, keKhaiCu: any): CanhBao[] {
  if (!keKhaiCu) return []
  const canhBao: CanhBao[] = []

  for (const { field, ten } of CT_FIELDS) {
    const cu = Number(keKhaiCu[field]) || 0
    const moi = Number(keKhaiMoi[field]) || 0
    if (cu === moi) continue

    // CT03, CT04: chỉ là 0 hoặc 1 — bất kỳ thay đổi nào cũng đáng xem xét
    if (field === 'ct03_ho_ngheo' || field === 'ct04_ho_can_ngheo') {
      if (cu !== moi) {
        const huong = moi > cu ? 'tăng' : 'giảm'
        canhBao.push({
          loai: 'dot_bien', chi_tieu: field, gia_tri_moi: moi, gia_tri_cu: cu,
          mo_ta: `${ten} ${huong} từ ${cu} → ${moi} so với đợt trước`,
        })
      }
      continue
    }

    // CT05, CT06: hiếm khi thay đổi
    if (field === 'ct05_nguoi_co_cong' || field === 'ct06_bao_tro_xh') {
      if (cu !== moi) {
        canhBao.push({
          loai: 'dot_bien', chi_tieu: field, gia_tri_moi: moi, gia_tri_cu: cu,
          mo_ta: `${ten} thay đổi từ ${cu} → ${moi} (chỉ tiêu này hiếm khi biến động)`,
        })
      }
      continue
    }

    // CT11: BHYT thường tăng, giảm nhiều là lạ
    if (field === 'ct11_tham_gia_bhyt' && cu > 0 && moi < cu) {
      const giamPct = Math.round(((cu - moi) / cu) * 100)
      if (giamPct >= 30) {
        canhBao.push({
          loai: 'dot_bien', chi_tieu: field, gia_tri_moi: moi, gia_tri_cu: cu,
          mo_ta: `${ten} giảm ${giamPct}% (${cu} → ${moi}), BHYT thường không giảm nhiều`,
        })
      }
      continue
    }

    // Các CT khác: cảnh báo nếu thay đổi > 50%
    if (cu > 0) {
      const pct = Math.round((Math.abs(moi - cu) / cu) * 100)
      if (pct >= 50) {
        const huong = moi > cu ? 'tăng' : 'giảm'
        canhBao.push({
          loai: 'dot_bien', chi_tieu: field, gia_tri_moi: moi, gia_tri_cu: cu,
          mo_ta: `${ten} ${huong} ${pct}% so với đợt trước (${cu} → ${moi})`,
        })
      }
    }
  }
  return canhBao
}

// === 2. So sánh với các hộ khác trong thôn — phát hiện outlier ===
async function kiemTraOutlier(keKhaiMoi: any, hoDanId: number, thonId: number, dotId: number): Promise<CanhBao[]> {
  const result = await query(`
    SELECT
      AVG(kk.ct02_tong_nhan_khau) AS avg_ct02, STDDEV_POP(kk.ct02_tong_nhan_khau) AS std_ct02,
      AVG(kk.ct07_tre_duoi_16) AS avg_ct07, STDDEV_POP(kk.ct07_tre_duoi_16) AS std_ct07,
      AVG(kk.ct10_tuoi_lao_dong) AS avg_ct10, STDDEV_POP(kk.ct10_tuoi_lao_dong) AS std_ct10,
      AVG(kk.ct11_tham_gia_bhyt) AS avg_ct11, STDDEV_POP(kk.ct11_tham_gia_bhyt) AS std_ct11
    FROM ke_khai_ho kk
    JOIN ho_dan hd ON kk.ho_dan_id = hd.id
    WHERE hd.thon_id = $1 AND kk.dot_id = $2 AND kk.ho_dan_id != $3
      AND kk.trang_thai IN ('da_ke_khai', 'da_duyet')
  `, [thonId, dotId, hoDanId])

  const stats = result.rows[0]
  if (!stats || !stats.avg_ct02) return []

  const canhBao: CanhBao[] = []
  const fieldsToCheck = [
    { field: 'ct02_tong_nhan_khau', ten: 'Tổng nhân khẩu', avg: stats.avg_ct02, std: stats.std_ct02 },
    { field: 'ct07_tre_duoi_16', ten: 'Trẻ em dưới 16', avg: stats.avg_ct07, std: stats.std_ct07 },
    { field: 'ct10_tuoi_lao_dong', ten: 'Tuổi lao động', avg: stats.avg_ct10, std: stats.std_ct10 },
    { field: 'ct11_tham_gia_bhyt', ten: 'Tham gia BHYT', avg: stats.avg_ct11, std: stats.std_ct11 },
  ]

  for (const { field, ten, avg, std } of fieldsToCheck) {
    const moi = Number(keKhaiMoi[field]) || 0
    const avgNum = Number(avg) || 0
    const stdNum = Number(std) || 0
    if (avgNum === 0 || stdNum === 0) continue

    if (moi > avgNum + 2 * stdNum) {
      canhBao.push({
        loai: 'outlier', chi_tieu: field, gia_tri_moi: moi,
        trung_binh_thon: Math.round(avgNum * 10) / 10,
        mo_ta: `${ten} = ${moi}, cao hơn nhiều so với trung bình thôn (${(Math.round(avgNum * 10) / 10)})`,
      })
    }
  }
  return canhBao
}

// === 3. Kiểm tra tỷ lệ bất thường ===
function kiemTraTyLe(keKhaiMoi: any): CanhBao[] {
  const canhBao: CanhBao[] = []
  const ct02 = Number(keKhaiMoi.ct02_tong_nhan_khau) || 0
  const ct07 = Number(keKhaiMoi.ct07_tre_duoi_16) || 0

  if (ct02 > 0 && ct07 > 0 && ct07 / ct02 > 0.5) {
    canhBao.push({
      loai: 'ty_le', chi_tieu: 'ct07_tre_duoi_16', gia_tri_moi: ct07,
      mo_ta: `Trẻ em chiếm ${Math.round((ct07 / ct02) * 100)}% nhân khẩu (${ct07}/${ct02}), tỷ lệ cao bất thường`,
    })
  }

  return canhBao
}

// === 4. Lấy kê khai đợt trước gần nhất ===
async function layKeKhaiDotTruoc(hoDanId: number, dotId: number) {
  const result = await query(`
    SELECT kk.* FROM ke_khai_ho kk
    JOIN dot_ke_khai dk ON kk.dot_id = dk.id
    WHERE kk.ho_dan_id = $1 AND kk.dot_id != $2
      AND dk.ngay_bat_dau < (SELECT ngay_bat_dau FROM dot_ke_khai WHERE id = $2)
    ORDER BY dk.ngay_bat_dau DESC
    LIMIT 1
  `, [hoDanId, dotId])
  return result.rows[0] || null
}

// === ENTRY POINT: Chạy tất cả kiểm tra sau khi dân nộp kê khai ===
export async function kiemTraBatThuong(keKhai: any) {
  try {
    const hoDan = await hoDanRepo.timTheoId(keKhai.ho_dan_id)
    if (!hoDan) return

    const keKhaiCu = await layKeKhaiDotTruoc(keKhai.ho_dan_id, keKhai.dot_id)

    const tatCaCanhBao: CanhBao[] = [
      ...kiemTraDotBien(keKhai, keKhaiCu),
      ...await kiemTraOutlier(keKhai, keKhai.ho_dan_id, hoDan.thon_id, keKhai.dot_id),
      ...kiemTraTyLe(keKhai),
    ]

    if (tatCaCanhBao.length === 0) return

    const canBoThon = await nguoiDungRepo.layDanhSach('thon', hoDan.thon_id, null)
    if (canBoThon.length === 0) return

    const noiDung = tatCaCanhBao.map((cb, i) => `${i + 1}. [${cb.loai.toUpperCase()}] ${cb.mo_ta}`).join('\n')

    const danhSachTB = canBoThon.map(cb => ({
      tieu_de: `⚠ Phát hiện ${tatCaCanhBao.length} dữ liệu bất thường — Hộ ${hoDan.ho_ten_chu_ho}`,
      noi_dung: `Hộ "${hoDan.ho_ten_chu_ho}" vừa nộp kê khai có dữ liệu cần kiểm tra:\n${noiDung}\n\nVui lòng xem xét và yêu cầu kê khai lại nếu cần.`,
      loai: 'canh_bao_bat_thuong',
      nguoi_nhan_id: cb.id,
      thon_id: hoDan.thon_id,
      dot_id: keKhai.dot_id,
    }))

    await thongBaoRepo.taoNhieu(danhSachTB)
  } catch (err) {
    console.error('[AnomalyService] Loi khi kiem tra bat thuong:', (err as Error).message)
  }
}
