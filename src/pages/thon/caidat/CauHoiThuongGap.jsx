import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const danhSachCauHoi = [
  {
    cauHoi: 'Làm sao duyệt dữ liệu kê khai của dân?',
    traLoi: 'Vào mục "Nhiệm Vụ", chọn đợt kê khai cần duyệt. Hệ thống hiển thị danh sách các hộ đã kê khai. Bạn có thể xem chi tiết từng hộ và bấm "Duyệt" hoặc "Từ chối" nếu phát hiện sai sót.',
  },
  {
    cauHoi: 'Nhập chỉ tiêu thủ công (CT09, CT12, CT13, CT14) ở đâu?',
    traLoi: 'Vào mục "Nhiệm Vụ", chọn đợt kê khai. Trong phần chi tiết đợt, bấm "Nhập chỉ tiêu thủ công" để nhập các chỉ tiêu mà chỉ cán bộ thôn mới có dữ liệu (CT09, CT12, CT13, CT14).',
  },
  {
    cauHoi: 'Làm sao xem tiến độ kê khai của dân trong thôn?',
    traLoi: 'Tại trang "Tổng Quan", bạn có thể xem tổng số hộ đã kê khai, chưa kê khai, và tỷ lệ hoàn thành theo từng đợt.',
  },
  {
    cauHoi: 'Nộp báo cáo lên xã như thế nào?',
    traLoi: 'Sau khi duyệt xong dữ liệu kê khai của dân và nhập xong các chỉ tiêu thủ công, vào đợt kê khai và bấm "Nộp lên xã". Hệ thống sẽ tổng hợp CT01-CT14 của thôn và gửi lên cấp xã.',
  },
  {
    cauHoi: 'Gửi thông báo nhắc dân kê khai bằng cách nào?',
    traLoi: 'Vào mục "Thông Báo", tạo thông báo mới nhắc nhở các hộ chưa kê khai. Thông báo sẽ hiện trên web và đồng thời gửi qua Zalo OA đến người dân.',
  },
  {
    cauHoi: 'Dữ liệu có được bảo mật không?',
    traLoi: 'Có. Dữ liệu được mã hóa và lưu trữ an toàn trên hệ thống Supabase. Chỉ cán bộ thôn và xã có thẩm quyền mới được truy cập dữ liệu kê khai trong phạm vi quản lý.',
  },
  {
    cauHoi: 'Quên mật khẩu thì phải làm sao?',
    traLoi: 'Vào mục "Cài đặt" → "Thay đổi mật khẩu" để đặt mật khẩu mới. Nếu không đăng nhập được, hãy liên hệ cán bộ xã hoặc gọi số hotline 0236 3846 789.',
  },
  {
    cauHoi: 'Nếu phát hiện dân kê khai sai thì xử lý thế nào?',
    traLoi: 'Khi duyệt dữ liệu, nếu phát hiện thông tin bất thường, bấm "Từ chối" và ghi lý do. Hệ thống sẽ thông báo cho hộ dân đó để kê khai lại. Bạn cũng có thể liên hệ trực tiếp với chủ hộ.',
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
