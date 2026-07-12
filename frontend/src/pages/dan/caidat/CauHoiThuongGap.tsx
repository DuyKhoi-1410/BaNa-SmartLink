import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const danhSachCauHoi = [
  {
    cauHoi: 'Làm sao để bắt đầu kê khai?',
    traLoi: 'Sau khi đăng nhập, bạn vào mục "Kê Khai" trên thanh menu. Nếu có đợt kê khai đang mở, bạn sẽ thấy nút "Bắt đầu kê khai". Bấm vào đó và điền thông tin theo từng bước hướng dẫn trên màn hình.',
  },
  {
    cauHoi: 'Tôi có thể sửa dữ liệu đã kê khai không?',
    traLoi: 'Nếu đợt kê khai vẫn còn trong thời hạn và cán bộ thôn chưa duyệt, bạn có thể vào lại trang kê khai để chỉnh sửa. Sau khi cán bộ thôn duyệt, bạn cần liên hệ cán bộ thôn để được hỗ trợ.',
  },
  {
    cauHoi: 'Kê khai có bắt buộc không?',
    traLoi: 'Có. Mỗi hộ gia đình cần kê khai đầy đủ theo từng đợt do xã phát động. Việc kê khai giúp xã nắm bắt tình hình và lập báo cáo chính xác.',
  },
  {
    cauHoi: 'Tôi quên mật khẩu thì phải làm sao?',
    traLoi: 'Bạn có thể vào mục "Cài đặt" → "Thay đổi mật khẩu" để đặt mật khẩu mới. Nếu không đăng nhập được, hãy liên hệ cán bộ thôn hoặc gọi số hotline 0236 3846 789 để được hỗ trợ.',
  },
  {
    cauHoi: 'Dữ liệu của tôi có được bảo mật không?',
    traLoi: 'Có. Dữ liệu được mã hóa và lưu trữ an toàn trên hệ thống. Chỉ cán bộ thôn và xã có thẩm quyền mới được xem dữ liệu kê khai của bạn.',
  },
  {
    cauHoi: 'Lần kê khai sau có phải nhập lại từ đầu không?',
    traLoi: 'Không. Hệ thống sẽ giữ lại dữ liệu lần trước. Bạn chỉ cần xác nhận "Giữ nguyên" nếu không có thay đổi, hoặc bấm "Chỉnh sửa" nếu muốn cập nhật.',
  },
  {
    cauHoi: 'Thông báo trên Zalo hoạt động như thế nào?',
    traLoi: 'Khi xã tạo đợt kê khai mới hoặc gần hết hạn, hệ thống sẽ tự động gửi thông báo nhắc nhở qua Zalo OA. Bạn cần theo dõi Zalo OA của xã Bà Nà để nhận thông báo.',
  },
  {
    cauHoi: 'Tôi có thể đăng nhập trên nhiều thiết bị không?',
    traLoi: 'Có. Bạn có thể đăng nhập trên nhiều thiết bị cùng lúc (máy tính, điện thoại). Vào mục "Quản lý thiết bị" trong Cài đặt để xem và quản lý các thiết bị đang đăng nhập.',
  },
]

export default function CauHoiThuongGap() {
  const [cauMo, setCauMo] = useState(null)

  const batTat = (i) => {
    setCauMo(cauMo === i ? null : i)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <HelpCircle size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Câu Hỏi Thường Gặp</h1>
          <p className="text-slate-500 text-sm">Giải đáp những thắc mắc phổ biến khi sử dụng hệ thống</p>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-3">
          {danhSachCauHoi.map((muc, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300
                ${cauMo === i ? 'border-blue-200 bg-blue-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <button
                onClick={() => batTat(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className={`font-medium ${cauMo === i ? 'text-blue-700' : 'text-slate-700'}`}>
                  {muc.cauHoi}
                </span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 ml-3 transition-transform duration-300
                    ${cauMo === i ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300
                  ${cauMo === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="px-5 pb-4 text-slate-600 leading-relaxed">
                  {muc.traLoi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
