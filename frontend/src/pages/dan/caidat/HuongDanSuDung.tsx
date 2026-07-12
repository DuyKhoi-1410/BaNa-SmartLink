import { BookOpen, LogIn, FileText, CheckCircle, Bell, Settings, Phone } from 'lucide-react'

const danhSachBuoc = [
  {
    buoc: 1,
    tieuDe: 'Đăng nhập vào hệ thống',
    moTa: 'Mở trình duyệt web trên máy tính hoặc điện thoại. Nhập số điện thoại và mật khẩu đã được cấp. Nếu đăng nhập lần đầu, hãy sử dụng mật khẩu mặc định và đổi mật khẩu mới ngay sau khi vào.',
    icon: LogIn,
    mau: 'bg-blue-50 text-blue-600',
  },
  {
    buoc: 2,
    tieuDe: 'Bắt đầu kê khai',
    moTa: 'Ở trang chủ, bấm vào mục "Kê Khai". Nếu có đợt kê khai đang mở, bạn sẽ thấy thông tin chi tiết và nút "Bắt đầu kê khai". Bấm vào để bắt đầu điền thông tin.',
    icon: FileText,
    mau: 'bg-blue-50 text-blue-600',
  },
  {
    buoc: 3,
    tieuDe: 'Điền thông tin từng bước',
    moTa: 'Hệ thống sẽ hướng dẫn bạn điền thông tin theo từng chỉ tiêu (CT02, CT03, CT04...). Mỗi bước có hướng dẫn rõ ràng. Nếu là lần kê khai sau, dữ liệu cũ sẽ được giữ sẵn — bạn chỉ cần xác nhận hoặc sửa.',
    icon: CheckCircle,
    mau: 'bg-green-50 text-green-600',
  },
  {
    buoc: 4,
    tieuDe: 'Gửi kê khai',
    moTa: 'Sau khi điền đầy đủ, hệ thống sẽ hiện trang xác nhận để bạn kiểm tra lại. Bấm "Gửi kê khai" để nộp cho cán bộ thôn duyệt. Bạn sẽ nhận thông báo khi kết quả duyệt có.',
    icon: CheckCircle,
    mau: 'bg-purple-50 text-purple-600',
  },
  {
    buoc: 5,
    tieuDe: 'Theo dõi thông báo',
    moTa: 'Vào mục "Thông Báo" để xem các cập nhật mới nhất: đợt kê khai mới, nhắc nhở sắp hết hạn, kết quả duyệt từ cán bộ thôn. Bạn cũng sẽ nhận thông báo qua Zalo.',
    icon: Bell,
    mau: 'bg-indigo-50 text-indigo-600',
  },
  {
    buoc: 6,
    tieuDe: 'Quản lý tài khoản',
    moTa: 'Vào mục "Cài Đặt" để xem thông tin cá nhân, đổi mật khẩu, quản lý thiết bị đăng nhập, và cập nhật email/số điện thoại.',
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
                Liên hệ cán bộ thôn hoặc gọi số <span className="font-bold">0236 3846 789</span> (giờ hành chính)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
