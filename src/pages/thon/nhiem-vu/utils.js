export function tinhTrangThai(ngayHetHan) {
  const homNay = new Date()
  homNay.setHours(0, 0, 0, 0)
  const hanChot = new Date(ngayHetHan)
  hanChot.setHours(0, 0, 0, 0)
  const soNgayCon = Math.ceil((hanChot - homNay) / (1000 * 60 * 60 * 24))

  if (soNgayCon < 0) return { nhan: 'Đã hết hạn', mau: 'bg-red-100 text-red-700', loaiTrangThai: 'het-han' }
  if (soNgayCon <= 3) return { nhan: 'Sắp hết hạn', mau: 'bg-blue-100 text-blue-700', loaiTrangThai: 'sap-het-han', soNgayCon }
  return { nhan: 'Đang diễn ra', mau: 'bg-emerald-100 text-emerald-700', loaiTrangThai: 'dang-dien-ra' }
}

export function dinhDangNgay(chuoiNgay) {
  const ngay = new Date(chuoiNgay)
  return ngay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function tinhThongKeHo(danhSachHo, tongSoHoThuc) {
  const tongHo = tongSoHoThuc ?? danhSachHo.length
  const choDuyet = danhSachHo.filter(h => h.daNop && (h.trangThaiDuyet === 'cho-duyet' || !h.trangThaiDuyet) && h.trangThaiDuyet !== 'tu-choi').length
  const daDuyet = danhSachHo.filter(h => h.daNop && h.trangThaiDuyet === 'da-duyet').length
  const daNop = choDuyet + daDuyet
  const chuaNop = tongHo - daNop
  const ptDaDuyet = tongHo > 0 ? Math.round((daDuyet / tongHo) * 100) : 0
  const ptChoDuyet = tongHo > 0 ? Math.round((choDuyet / tongHo) * 100) : 0

  return { tongHo, daNop, chuaNop, choDuyet, daDuyet, ptDaDuyet, ptChoDuyet }
}
