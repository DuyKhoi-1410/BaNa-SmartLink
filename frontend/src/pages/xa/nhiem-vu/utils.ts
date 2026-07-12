import { danhSach10Thon } from './constants'

export function tinhTrangThai(ngayHetHan: any) {
  const homNay = new Date()
  homNay.setHours(0, 0, 0, 0)
  const hanChot = new Date(ngayHetHan)
  hanChot.setHours(0, 0, 0, 0)
  const soNgayCon = Math.ceil((hanChot.getTime() - homNay.getTime()) / (1000 * 60 * 60 * 24))

  if (soNgayCon < 0) return { nhan: 'Đã hết hạn', mau: 'bg-red-100 text-red-700', loaiTrangThai: 'het-han' }
  if (soNgayCon <= 3) return { nhan: 'Sắp hết hạn', mau: 'bg-blue-100 text-blue-700', loaiTrangThai: 'sap-het-han', soNgayCon }
  return { nhan: 'Đang diễn ra', mau: 'bg-emerald-100 text-emerald-700', loaiTrangThai: 'dang-dien-ra' }
}

export function dinhDangNgay(chuoiNgay) {
  const ngay = new Date(chuoiNgay)
  return ngay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function taoDuLieuThon(baoCao) {
  const { soThonDaNop, chiTieu } = baoCao
  return danhSach10Thon.map((ten, i) => {
    const daNop = i < soThonDaNop
    if (!daNop) return { ten, daNop: false }

    const ngayNop = new Date(baoCao.ngayBatDau)
    ngayNop.setDate(ngayNop.getDate() + Math.floor(Math.random() * 30) + 5)
    const chuoiNgayNop = ngayNop.toISOString().split('T')[0]

    const duLieuCT = {}
    chiTieu.forEach(ct => {
      const giaTriMau = {
        'CT01': 180 + Math.floor(Math.random() * 120),
        'CT02': 600 + Math.floor(Math.random() * 400),
        'CT03': Math.floor(Math.random() * 20),
        'CT04': Math.floor(Math.random() * 15),
        'CT05': Math.floor(Math.random() * 10),
        'CT06': Math.floor(Math.random() * 12),
        'CT07': 50 + Math.floor(Math.random() * 80),
        'CT08': Math.floor(Math.random() * 5),
        'CT09': 100 + Math.floor(Math.random() * 80),
        'CT10': 200 + Math.floor(Math.random() * 300),
        'CT11': 300 + Math.floor(Math.random() * 400),
        'CT12': 5 + Math.floor(Math.random() * 15),
        'CT13': 10 + Math.floor(Math.random() * 30),
        'CT14': Math.floor(Math.random() * 3),
      }
      duLieuCT[ct] = giaTriMau[ct] ?? 0
    })

    return { ten, daNop: true, ngayNop: chuoiNgayNop, duLieuCT }
  })
}
