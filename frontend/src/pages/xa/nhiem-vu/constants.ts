export const danhSachCT = {
  'CT01': 'Tổng số hộ dân',
  'CT02': 'Tổng số nhân khẩu',
  'CT03': 'Số hộ nghèo',
  'CT04': 'Số hộ cận nghèo',
  'CT05': 'Số người có công với CM',
  'CT06': 'Đối tượng bảo trợ XH',
  'CT07': 'Số trẻ em dưới 16 tuổi',
  'CT08': 'Trẻ em có hoàn cảnh đặc biệt',
  'CT09': 'Số hộ đạt "Gia đình văn hóa"',
  'CT10': 'Số người trong độ tuổi lao động',
  'CT11': 'Số người tham gia BHYT',
  'CT12': 'Thành viên Tổ CNSCĐ',
  'CT13': 'Người được hướng dẫn DVC trực tuyến',
  'CT14': 'Số vụ bạo lực gia đình',
}

export const duLieuMau = [
  {
    id: 99,
    ten: 'Rà soát tổng hợp tình hình hộ nghèo, cận nghèo, đối tượng bảo trợ xã hội và các trường hợp khó khăn đặc biệt trên địa bàn xã Bà Nà năm 2026',
    loai: 'dot-xuat',
    chiTieu: ['CT03', 'CT04', 'CT06'],
    ngayBatDau: '2026-06-15',
    ngayHetHan: '2026-08-01',
    soThonDaNop: 3,
    tongSoThon: 10,
    chiTiet: 'Rà soát, thống kê lại toàn bộ hộ nghèo, cận nghèo và đối tượng bảo trợ xã hội trên địa bàn xã để cập nhật danh sách mới nhất phục vụ chính sách hỗ trợ năm 2026.',
    dinhKem: [{ ten: 'CV_123_UBND_RaSoat.pdf', kichThuoc: 245000, moTa: 'Công văn chỉ đạo rà soát hộ nghèo' }, { ten: 'MauBieu_HoNgheo.docx', kichThuoc: 82000, moTa: 'Mẫu biểu kê khai hộ nghèo, cận nghèo' }],
  },
  {
    id: 1,
    ten: 'Kê khai Quý 2/2026',
    loai: 'dinh-ky',
    chiTieu: Object.keys(danhSachCT),
    ngayBatDau: '2026-04-01',
    ngayHetHan: '2026-07-10',
    soThonDaNop: 7,
    tongSoThon: 10,
    chiTiet: 'Kê khai định kỳ Quý 2/2026 tất cả 14 chỉ tiêu theo quy định. Các thôn hoàn thành trước ngày 10/07/2026.',
    dinhKem: [{ ten: 'ThongBao_KeKhaiQ2.pdf', kichThuoc: 156000, moTa: 'Thông báo triển khai kê khai Quý 2' }],
  },
  {
    id: 2,
    ten: 'Rà soát hộ nghèo, cận nghèo',
    loai: 'dot-xuat',
    chiTieu: ['CT03', 'CT04'],
    ngayBatDau: '2026-06-20',
    ngayHetHan: '2026-07-05',
    soThonDaNop: 4,
    tongSoThon: 10,
    chiTiet: 'Rà soát bổ sung hộ nghèo, cận nghèo theo chỉ đạo của UBND huyện Hòa Vang.',
    dinhKem: [],
  },
  {
    id: 3,
    ten: 'Kê khai Quý 1/2026',
    loai: 'dinh-ky',
    chiTieu: Object.keys(danhSachCT),
    ngayBatDau: '2026-01-01',
    ngayHetHan: '2026-03-31',
    soThonDaNop: 10,
    tongSoThon: 10,
    chiTiet: 'Kê khai định kỳ Quý 1/2026. Tất cả 10 thôn đã hoàn thành đúng hạn.',
    dinhKem: [{ ten: 'BaoCao_TongHop_Q1.xlsx', kichThuoc: 320000, moTa: 'Báo cáo tổng hợp số liệu Quý 1' }],
  },
  {
    id: 4,
    ten: 'Kiểm tra bạo lực gia đình',
    loai: 'dot-xuat',
    chiTieu: ['CT14'],
    ngayBatDau: '2026-05-10',
    ngayHetHan: '2026-06-01',
    soThonDaNop: 8,
    tongSoThon: 10,
    chiTiet: 'Thống kê số vụ bạo lực gia đình trên địa bàn xã theo yêu cầu của Hội Liên hiệp Phụ nữ huyện.',
    dinhKem: [{ ten: 'CV_HoiPhuNu_YeuCau.pdf', kichThuoc: 98000, moTa: 'Công văn yêu cầu từ Hội Phụ nữ huyện' }],
  },
]

export const danhSachTab = [
  { key: 'tat-ca', ten: 'Tất cả' },
  { key: 'dang-dien-ra', ten: 'Đang diễn ra' },
  { key: 'da-het-han', ten: 'Đã hết hạn' },
]

export const danhSach10Thon = [
  'Thôn Phú Hoà', 'Thôn Thái Lai', 'Thôn Phước Khương', 'Thôn Hoà Nhơn',
  'Thôn Sơn Phước', 'Thôn Hoà Ninh', 'Thôn An Sơn', 'Thôn Thạch Nham Đông',
  'Thôn Thạch Nham Tây', 'Thôn Phước Hưng',
]

export const formMacDinh = {
  ten: '',
  chiTieu: [],
  ngayBatDau: '',
  ngayHetHan: '',
  chiTiet: '',
  dinhKem: [],
}

export const mauSacBieuDo = [
  '#3b82f6', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444',
  '#06b6d4', '#4f46e5', '#6366f1', '#14b8a6', '#ec4899',
  '#2563eb', '#0ea5e9', '#22c55e', '#a855f7',
]
