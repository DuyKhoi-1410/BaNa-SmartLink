import { BookOpen, LogIn, ClipboardList, BarChart3, FileUp, Bell, Settings, Phone } from 'lucide-react'

const danhSachBuoc = [
  {
    buoc: 1,
    tieuDe: 'Đăng nhập vào hệ thống',
    moTa: 'Mở trình duyệt web trên máy tính hoặc điện thoại. Nhập tài khoản và mật khẩu cán bộ thôn đã được cấp. Nếu đăng nhập lần đầu, hãy sử dụng mật khẩu mặc định và đổi mật khẩu mới ngay sau khi vào.',
    icon: LogIn,
    mau: 'bg-blue-50 text-blue-600',
  },
  {
    buoc: 2,
    tieuDe: 'Duyệt dữ liệu kê khai của dân',
    moTa: 'Vào mục "Nhiệm Vụ", chọn đợt kê khai. Xem danh sách các hộ đã kê khai, kiểm tra thông tin và bấm "Duyệt" từng hộ. Nếu phát hiện sai sót, bấm "Từ chối" và ghi lý do để hộ dân kê khai lại.',
    icon: ClipboardList,
    mau: 'bg-blue-50 text-blue-600',
  },
  {
    buoc: 3,
    tieuDe: 'Nhập chỉ tiêu thủ công của thôn',
    moTa: 'Trong phần chi tiết đợt kê khai, nhập các chỉ tiêu CT09, CT12, CT13, CT14 — đây là dữ liệu mà chỉ cán bộ thôn mới có (hệ thống không tự tính được).',
    icon: BarChart3,
    mau: 'bg-green-50 text-green-600',
  },
  {
    buoc: 4,
    tieuDe: 'Nộp báo cáo lên xã',
    moTa: 'Sau khi duyệt xong dữ liệu dân và nhập xong chỉ tiêu thủ công, bấm "Nộp lên xã". Hệ thống tổng hợp CT01-CT14 của thôn và gửi cho cán bộ xã xem xét.',
    icon: FileUp,
    mau: 'bg-purple-50 text-purple-600',
  },
  {
    buoc: 5,
    tieuDe: 'Gửi thông báo nhắc dân',
    moTa: 'Vào mục "Thông Báo" để tạo và gửi thông báo nhắc nhở đến các hộ chưa kê khai. Hệ thống cũng tự động gửi nhắc nhở qua Zalo OA khi gần hết hạn.',
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
                Liên hệ cán bộ xã hoặc gọi số <span className="font-bold">0236 3846 789</span> (giờ hành chính)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
