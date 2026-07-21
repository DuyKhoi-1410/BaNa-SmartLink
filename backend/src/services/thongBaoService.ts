import * as thongBaoRepo from '../repositories/thongBaoRepo.js'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import * as hoDanRepo from '../repositories/hoDanRepo.js'
import * as thonRepo from '../repositories/thonRepo.js'
import * as dotKeKhaiRepo from '../repositories/dotKeKhaiRepo.js'
import { dotCoCTDan } from '../repositories/dotKeKhaiRepo.js'
import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import * as keKhaiThonRepo from '../repositories/keKhaiThonRepo.js'

// === 1. Xã tạo đợt kê khai → Thông báo cho TẤT CẢ cán bộ thôn + dân ===
export async function thongBaoTaoDot(dot, nguoiTaoId) {
  const danhSachTB = []
  const thons = await thonRepo.layTatCa()

  // Gửi cho từng cán bộ thôn
  const canBoThon = await nguoiDungRepo.layDanhSach('thon', null, null)
  for (const cb of canBoThon) {
    danhSachTB.push({
      tieu_de: `Đợt kê khai mới: ${dot.ten_dot}`,
      noi_dung: `Xã đã tạo đợt kê khai "${dot.ten_dot}". Hạn nộp: ${formatNgay(dot.ngay_ket_thuc)}. Vui lòng theo dõi và đôn đốc dân kê khai.`,
      loai: 'bao_cao_moi',
      nguoi_gui_id: nguoiTaoId,
      nguoi_nhan_id: cb.id,
      thon_id: cb.thon_id,
      dot_id: dot.id,
    })
  }

  // Gửi cho từng chủ hộ (vai_tro = 'dan') — chỉ khi đợt có CT dân cần kê
  if (dotCoCTDan(dot.chi_tieu)) {
    const danhSachDan = await nguoiDungRepo.layDanhSach('dan', null, null)
    for (const dan of danhSachDan) {
      danhSachTB.push({
        tieu_de: `Có đợt kê khai mới`,
        noi_dung: `Đợt "${dot.ten_dot}" đã mở. Hạn nộp: ${formatNgay(dot.ngay_ket_thuc)}. Vui lòng vào hệ thống để kê khai.`,
        loai: 'bao_cao_moi',
        nguoi_gui_id: nguoiTaoId,
        nguoi_nhan_id: dan.id,
        dot_id: dot.id,
      })
    }
  }

  if (danhSachTB.length > 0) {
    await thongBaoRepo.taoNhieu(danhSachTB)
  }
}

// === 2. Dân nộp kê khai → Chỉ thông báo cho cán bộ thôn khi 100% dân trong thôn đã nộp ===
export async function thongBaoDanNopKeKhai(keKhai, nguoiKeKhaiId) {
  const hoDan = await hoDanRepo.timTheoId(keKhai.ho_dan_id)
  if (!hoDan) return

  const tienDo = await keKhaiHoRepo.tienDoThon(keKhai.dot_id, hoDan.thon_id)
  const tongHo = parseInt(tienDo.tong_ho) || 0
  const daKeKhai = parseInt(tienDo.da_ke_khai) || 0

  if (tongHo === 0 || daKeKhai < tongHo) return

  const canBoThon = await nguoiDungRepo.layDanhSach('thon', hoDan.thon_id, null)
  const danhSachTB = canBoThon.map(cb => ({
    tieu_de: `100% hộ dân đã nộp kê khai`,
    noi_dung: `Tất cả ${tongHo} hộ dân trong thôn đã hoàn thành kê khai. Vui lòng kiểm tra và duyệt.`,
    loai: 'dan_nop_het',
    nguoi_gui_id: nguoiKeKhaiId,
    nguoi_nhan_id: cb.id,
    thon_id: hoDan.thon_id,
    dot_id: keKhai.dot_id,
  }))

  if (danhSachTB.length > 0) {
    await thongBaoRepo.taoNhieu(danhSachTB)
  }
}

// === 3. Thôn duyệt kê khai → Thông báo cho dân ===
export async function thongBaoDuyetKeKhai(keKhai) {
  const hoDan = await hoDanRepo.timTheoId(keKhai.ho_dan_id)
  if (!hoDan) return

  await thongBaoRepo.taoMoi({
    tieu_de: `Kê khai đã được duyệt`,
    noi_dung: `Kê khai của hộ bạn đã được cán bộ thôn duyệt thành công.`,
    loai: 'da_duyet',
    nguoi_nhan_id: hoDan.chu_ho_id,
    dot_id: keKhai.dot_id,
  })
}

// === 4. Thôn trả lại kê khai → Thông báo cho dân ===
export async function thongBaoTraLaiKeKhai(keKhai, lyDo) {
  const hoDan = await hoDanRepo.timTheoId(keKhai.ho_dan_id)
  if (!hoDan) return

  await thongBaoRepo.taoMoi({
    tieu_de: `Kê khai bị trả lại`,
    noi_dung: `Kê khai của hộ bạn bị trả lại. Lý do: ${lyDo}. Vui lòng chỉnh sửa và nộp lại.`,
    loai: 'yeu_cau_sua',
    nguoi_nhan_id: hoDan.chu_ho_id,
    dot_id: keKhai.dot_id,
  })
}

// === 5. Thôn nộp xã → Chỉ thông báo cho cán bộ xã khi 100% thôn đã nộp ===
export async function thongBaoThonNopXa(dotId, thonId) {
  const tatCaThon = await thonRepo.layTatCa()
  const keKhaiThonList = await keKhaiThonRepo.layTheoDot(dotId)

  const soThonDaNop = keKhaiThonList.filter(kt => kt.trang_thai === 'da_nop_xa').length
  const tongThon = tatCaThon.length

  if (tongThon === 0 || soThonDaNop < tongThon) return

  const canBoXa = await nguoiDungRepo.layDanhSach('xa', null, null)
  const danhSachTB = canBoXa.map(cb => ({
    tieu_de: `Tất cả ${tongThon} thôn đã nộp báo cáo`,
    noi_dung: `100% thôn (${tongThon}/${tongThon}) đã hoàn thành và nộp báo cáo kê khai lên xã.`,
    loai: 'hoan_thanh',
    nguoi_nhan_id: cb.id,
    dot_id: dotId,
  }))

  if (danhSachTB.length > 0) {
    await thongBaoRepo.taoNhieu(danhSachTB)
  }
}

// === 6. Nhắc hạn nộp (gọi bởi cron) ===
export async function nhacHanNop() {
  const tatCaDot = await dotKeKhaiRepo.layDangMo()
  const homNay = new Date()
  homNay.setHours(0, 0, 0, 0)

  for (const dot of tatCaDot) {
    const ngayHetHan = new Date(dot.ngay_ket_thuc)
    ngayHetHan.setHours(0, 0, 0, 0)
    const soNgayCon = Math.ceil((ngayHetHan - homNay) / (1000 * 60 * 60 * 24))

    if (soNgayCon !== 1 && soNgayCon !== 2) continue

    const loai = soNgayCon === 1 ? 'nhac_1_ngay' : 'nhac_2_ngay'
    const chuSoNgay = soNgayCon === 1 ? '1 ngày' : '2 ngày'

    // Nhắc dân chưa kê khai — chỉ khi đợt có CT dân
    const thons = await thonRepo.layTatCa()
    const canNhacDan = dotCoCTDan(dot.chi_tieu)
    for (const thon of thons) {
      if (canNhacDan) {
        const danhSachHo = await hoDanRepo.layTheoThon(thon.id, 'dang_cu_tru')
        for (const ho of danhSachHo) {
          const daGui = await thongBaoRepo.daGuiThongBao(dot.id, loai, ho.chu_ho_id, null)
          if (daGui) continue

          const keKhai = await keKhaiHoRepo.timTheoHoDanVaDot(ho.id, dot.id)
          if (keKhai && keKhai.trang_thai !== 'chua_ke_khai' && keKhai.trang_thai !== 'tra_lai') continue

          await thongBaoRepo.taoMoi({
            tieu_de: `Còn ${chuSoNgay} để kê khai`,
            noi_dung: `Đợt "${dot.ten_dot}" sẽ hết hạn sau ${chuSoNgay}. Vui lòng hoàn thành kê khai trước hạn.`,
            loai,
            nguoi_nhan_id: ho.chu_ho_id,
            dot_id: dot.id,
          })
        }
      }

      // Nhắc cán bộ thôn chưa nộp xã
      const daGuiThon = await thongBaoRepo.daGuiThongBao(dot.id, loai, null, thon.id)
      if (!daGuiThon) {
        const canBoThon = await nguoiDungRepo.layDanhSach('thon', thon.id, null)
        const danhSachTB = canBoThon.map(cb => ({
          tieu_de: `Còn ${chuSoNgay} để nộp báo cáo`,
          noi_dung: `Đợt "${dot.ten_dot}" sẽ hết hạn sau ${chuSoNgay}. Vui lòng hoàn thành duyệt và nộp báo cáo lên xã.`,
          loai,
          nguoi_nhan_id: cb.id,
          thon_id: thon.id,
          dot_id: dot.id,
        }))
        if (danhSachTB.length > 0) {
          await thongBaoRepo.taoNhieu(danhSachTB)
        }
      }
    }

    // Nhắc cán bộ xã
    const daGuiXa = await thongBaoRepo.daGuiThongBao(dot.id, loai, null, null)
    if (!daGuiXa) {
      const canBoXa = await nguoiDungRepo.layDanhSach('xa', null, null)
      const danhSachTB = canBoXa.map(cb => ({
        tieu_de: `Đợt "${dot.ten_dot}" còn ${chuSoNgay}`,
        noi_dung: `Đợt kê khai "${dot.ten_dot}" sẽ hết hạn sau ${chuSoNgay}.`,
        loai,
        nguoi_nhan_id: cb.id,
        dot_id: dot.id,
      }))
      if (danhSachTB.length > 0) {
        await thongBaoRepo.taoNhieu(danhSachTB)
      }
    }
  }
}

function formatNgay(ngay) {
  if (!ngay) return ''
  const d = new Date(ngay)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
