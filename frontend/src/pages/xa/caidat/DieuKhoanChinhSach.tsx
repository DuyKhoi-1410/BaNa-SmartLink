import { FileText, Shield } from 'lucide-react'

export default function DieuKhoanChinhSach() {
  return (
    <div className="space-y-6">
      {/* Điều khoản sử dụng */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Điều Khoản Sử Dụng</h1>
            <p className="text-slate-500 text-sm">Cập nhật lần cuối: 01/01/2025</p>
          </div>
        </div>

        <div className="p-8 prose prose-slate max-w-none">
          <h3 className="text-lg font-bold text-slate-800 mb-3">1. Giới thiệu</h3>
          <p className="text-slate-600 leading-relaxed mb-5">
            Ba Na SmartLink là nền tảng số hóa quy trình kê khai và báo cáo dữ liệu từ người dân đến cấp thôn và xã
            trên địa bàn xã Bà Nà, huyện Hòa Vang, TP. Đà Nẵng. Khi sử dụng hệ thống, bạn đồng ý tuân thủ
            các điều khoản dưới đây.
          </p>

          <h3 className="text-lg font-bold text-slate-800 mb-3">2. Quyền và trách nhiệm người dùng</h3>
          <ul className="text-slate-600 space-y-2 mb-5 list-disc pl-5">
            <li>Cung cấp thông tin kê khai chính xác, trung thực</li>
            <li>Bảo mật tài khoản cá nhân, không chia sẻ mật khẩu cho người khác</li>
            <li>Kê khai đúng hạn theo thông báo từ cấp xã</li>
            <li>Không sử dụng hệ thống vào mục đích gian lận hoặc phá hoại</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 mb-3">3. Quyền của hệ thống</h3>
          <ul className="text-slate-600 space-y-2 mb-5 list-disc pl-5">
            <li>Thu thập và lưu trữ dữ liệu kê khai phục vụ công tác báo cáo</li>
            <li>Gửi thông báo nhắc nhở qua hệ thống và Zalo OA</li>
            <li>Tạm khóa tài khoản nếu phát hiện hành vi vi phạm</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 mb-3">4. Giới hạn trách nhiệm</h3>
          <p className="text-slate-600 leading-relaxed">
            Hệ thống cam kết nỗ lực duy trì hoạt động ổn định. Tuy nhiên, chúng tôi không chịu trách nhiệm
            cho các gián đoạn do sự cố kỹ thuật, thiên tai, hoặc các yếu tố ngoài tầm kiểm soát.
          </p>
        </div>
      </div>

      {/* Chính sách quyền riêng tư */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Chính Sách Quyền Riêng Tư</h2>
            <p className="text-slate-500 text-sm">Cập nhật lần cuối: 01/01/2025</p>
          </div>
        </div>

        <div className="p-8 prose prose-slate max-w-none">
          <h3 className="text-lg font-bold text-slate-800 mb-3">1. Dữ liệu chúng tôi thu thập</h3>
          <ul className="text-slate-600 space-y-2 mb-5 list-disc pl-5">
            <li>Thông tin cá nhân: họ tên, số điện thoại, email, địa chỉ</li>
            <li>Dữ liệu kê khai theo các chỉ tiêu CT01-CT14</li>
            <li>Thông tin thiết bị và lịch sử đăng nhập</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 mb-3">2. Mục đích sử dụng</h3>
          <ul className="text-slate-600 space-y-2 mb-5 list-disc pl-5">
            <li>Phục vụ quy trình kê khai, duyệt và tổng hợp báo cáo cấp thôn — xã</li>
            <li>Gửi thông báo và nhắc nhở liên quan đến đợt kê khai</li>
            <li>Phân tích dữ liệu tổng hợp (không nhận dạng cá nhân) cho mục đích cải thiện chất lượng dịch vụ</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 mb-3">3. Bảo mật dữ liệu</h3>
          <p className="text-slate-600 leading-relaxed mb-5">
            Dữ liệu được lưu trữ trên nền tảng Supabase với mã hóa SSL. Chỉ cán bộ thôn và xã có thẩm quyền
            mới được truy cập dữ liệu kê khai của người dân trong phạm vi quản lý.
          </p>

          <h3 className="text-lg font-bold text-slate-800 mb-3">4. Quyền của người dùng</h3>
          <ul className="text-slate-600 space-y-2 list-disc pl-5">
            <li>Xem và chỉnh sửa thông tin cá nhân bất kỳ lúc nào</li>
            <li>Yêu cầu xóa tài khoản thông qua cán bộ xã</li>
            <li>Được thông báo khi có thay đổi chính sách</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
