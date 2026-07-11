import { taoTenHo } from './constants'

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

export function taoDuLieuHoDan(nhiemVu) {
  const { soHoDaNop, tongSoHo, chiTieu } = nhiemVu

  return Array.from({ length: tongSoHo }, (_, i) => {
    const ten = taoTenHo(i)
    const daNop = i < soHoDaNop
    if (!daNop) return { ten, daNop: false }

    const ngayNop = new Date(nhiemVu.ngayBatDau)
    ngayNop.setDate(ngayNop.getDate() + Math.floor(Math.random() * 30) + 3)
    const chuoiNgayNop = ngayNop.toISOString().split('T')[0]

    const duLieuCT = {}
    chiTieu.forEach(ct => {
      const giaTriMau = {
        'CT01': 1,
        'CT02': 3 + Math.floor(Math.random() * 5),
        'CT03': Math.random() < 0.15 ? 1 : 0,
        'CT04': Math.random() < 0.1 ? 1 : 0,
        'CT05': Math.random() < 0.08 ? 1 : 0,
        'CT06': Math.random() < 0.1 ? 1 : 0,
        'CT07': Math.floor(Math.random() * 3),
        'CT08': Math.random() < 0.05 ? 1 : 0,
        'CT09': Math.random() < 0.7 ? 1 : 0,
        'CT10': 1 + Math.floor(Math.random() * 4),
        'CT11': 2 + Math.floor(Math.random() * 5),
        'CT12': Math.random() < 0.3 ? 1 : 0,
        'CT13': Math.random() < 0.2 ? 1 : 0,
        'CT14': Math.random() < 0.03 ? 1 : 0,
      }
      duLieuCT[ct] = giaTriMau[ct] ?? 0
    })

    const danhSachTrangThai = ['cho-duyet', 'da-duyet', 'da-duyet', 'da-duyet']
    const trangThaiDuyet = danhSachTrangThai[i % danhSachTrangThai.length]

    return {
      ten,
      daNop: true,
      ngayNop: chuoiNgayNop,
      duLieuCT,
      trangThaiDuyet,
    }
  })
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
