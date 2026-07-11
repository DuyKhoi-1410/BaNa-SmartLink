import { BookOpen, LogIn, ClipboardList, BarChart3, FileDown, Bell, Settings, Phone } from 'lucide-react'

const danhSachBuoc = [
  {
    buoc: 1,
    tieuDe: 'Đăng nhập vào hệ thống',
    moTa: 'Mở trình duyệt web trên máy tính hoặc điện thoại. Nhập tài khoản và mật khẩu cán bộ xã đã được cấp. Nếu đăng nhập lần đầu, hãy sử dụng mật khẩu mặc định và đổi mật khẩu mới ngay sau khi vào.',
    icon: LogIn,
    mau: 'bg-blue-50 text-blue-600',
  },
  {
    buoc: 2,
    tieuDe: 'Tạo đợt kê khai / nhiệm vụ báo cáo',
    moTa: 'Vào mục "Nhiệm Vụ Báo Cáo", bấm "Tạo đợt kê khai mới". Chọn loại (định kỳ theo quý hoặc đột xuất), đặt tên đợt, thời hạn nộp. Hệ thống sẽ tự động thông báo đến cán bộ thôn và người dân qua web và Zalo OA.',
    icon: ClipboardList,
    mau: 'bg-blue-50 text-blue-600',
  },
  {
    buoc: 3,
    tieuDe: 'Theo dõi tiến độ các thôn',
    moTa: 'Tại trang "Tổng Quan", xem biểu đồ tiến độ nộp của 10 thôn theo từng đợt kê khai. Bạn có thể theo dõi thôn nào đã nộp, thôn nào chưa nộp, và tỷ lệ hoàn thành tổng thể.',
    icon: BarChart3,
    mau: 'bg-green-50 text-green-600',
  },
  {
    buoc: 4,
    tieuDe: 'Tổng hợp dữ liệu & xuất báo cáo',
    moTa: 'Khi các thôn đã nộp đầy đủ, vào mục "Nhiệm Vụ Báo Cáo" để xem tổng hợp 14 chỉ tiêu (CT01-CT14) từ 10 thôn. Xuất báo cáo dưới dạng Excel, Word hoặc PDF kèm biểu đồ trực quan.',
    icon: FileDown,
    mau: 'bg-purple-50 text-purple-600',
  },
  {
    buoc: 5,
    tieuDe: 'Gửi thông báo nhắc việc',
    moTa: 'Vào mục "Thông Báo" để tạo và gửi thông báo nhắc nhở đến cán bộ thôn hoặc người dân. Hệ thống cũng tự động gửi nhắc nhở khi gần hết hạn kê khai qua Zalo OA.',
    icon: Bell,
    mau: 'bg-indigo-50 text-indigo-600',
  },
  {
    buoc: 6,
    tieuDe: 'Quản lý tài khoản',
    moTa: 'Vào mục "Cài Đặt" để xem thông tin cá nhân, đổi mật khẩu, quản lý thiết bị đăng nhập, và xác thực tài khoản.',
    icon: Settings,
    mau: 'bg-slate-100 text-slate-600',
  },
]

export default function HuongDanSuDung() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <BookOpen size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hướng Dẫn Sử Dụng</h1>
          <p className="text-slate-500 text-sm">Các bước cơ bản để sử dụng hệ thống Ba Na SmartLink</p>
        </div>
      </div>

      <div className="p-8">
        {/* Các bước hướng dẫn */}
        <div className="space-y-4">
          {danhSachBuoc.map((b) => (
            <div
              key={b.buoc}
              className="flex gap-5 p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-12 h-12 ${b.mau} rounded-xl flex items-center justify-center`}>
                  <b.icon size={22} />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-400">Bước {b.buoc}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{b.tieuDe}</h3>
                <p className="text-slate-600 mt-1 leading-relaxed">{b.moTa}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hỗ trợ */}
        <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">Cần hỗ trợ thêm?</p>
              <p className="text-sm text-blue-700 mt-0.5">
                Liên hệ quản trị viên hệ thống hoặc gọi số <span className="font-bold">0236 3846 789</span> (giờ hành chính)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
