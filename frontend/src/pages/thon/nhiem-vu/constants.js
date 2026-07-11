export { danhSachCT } from '../../xa/nhiem-vu/constants'

export const danhSachCTThonNhap = ['CT09', 'CT12', 'CT13', 'CT14']

const danhSachHo = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Ngô', 'Đỗ',
  'Phan', 'Huỳnh', 'Trương', 'Mai', 'Lý', 'Đinh', 'Vũ', 'Hồ', 'Dương', 'Tạ',
  'Lương', 'Tô', 'Hà', 'Cao', 'Châu', 'Quách', 'Thái', 'Tăng', 'Kiều', 'Từ',
]
const danhSachTenDem = ['Văn', 'Thị', 'Đức', 'Minh', 'Thanh', 'Quốc', 'Hữu', 'Ngọc', 'Xuân', 'Kim']
const danhSachTen = [
  'An', 'Bình', 'Cường', 'Dung', 'Em', 'Phương', 'Giang', 'Hoa', 'Khoa', 'Lan',
  'Minh', 'Ngọc', 'Phú', 'Quỳnh', 'Sơn', 'Tuyết', 'Uy', 'Vân', 'Xuân', 'Yến',
  'Hải', 'Tùng', 'Thảo', 'Hùng', 'Linh', 'Đạt', 'Trang', 'Nam', 'Hạnh', 'Long',
]

export function taoTenHo(index) {
  const ho = danhSachHo[index % danhSachHo.length]
  const dem = danhSachTenDem[Math.floor(index / danhSachHo.length) % danhSachTenDem.length]
  const ten = danhSachTen[index % danhSachTen.length]
  return `Hộ ${ho} ${dem} ${ten}`
}

export const danhSachTab = [
  { key: 'tat-ca', ten: 'Tất cả' },
  { key: 'dang-dien-ra', ten: 'Đang diễn ra' },
  { key: 'da-het-han', ten: 'Đã hết hạn' },
]
