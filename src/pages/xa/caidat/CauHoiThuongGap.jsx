import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const danhSachCauHoi = [
  {
    cauHoi: 'Làm sao để tạo đợt kê khai mới?',
    traLoi: 'Vào mục "Nhiệm Vụ Báo Cáo" trên thanh menu, bấm "Tạo đợt kê khai mới". Điền tên đợt, chọn loại (định kỳ hoặc đột xuất), đặt thời hạn và bấm "Tạo". Hệ thống sẽ tự động thông báo đến các thôn và người dân.',
  },
  {
    cauHoi: 'Làm sao xem tiến độ nộp của các thôn?',
    traLoi: 'Tại trang "Tổng Quan", bạn có thể xem biểu đồ tiến độ nộp của 10 thôn. Chọn đợt kê khai cụ thể để xem chi tiết thôn nào đã nộp, thôn nào chưa nộp.',
  },
  {
    cauHoi: 'Xuất báo cáo tổng hợp ở đâu?',
    traLoi: 'Vào mục "Nhiệm Vụ Báo Cáo", chọn đợt kê khai cần xuất. Hệ thống tổng hợp dữ liệu CT01-CT14 từ 10 thôn và cho phép xuất file Excel, Word hoặc PDF.',
  },
  {
    cauHoi: 'Cán bộ thôn chưa nộp báo cáo thì xử lý thế nào?',
    traLoi: 'Vào mục "Thông Báo" để gửi nhắc nhở trực tiếp đến cán bộ thôn chưa nộp. Hệ thống cũng tự động gửi thông báo nhắc nhở qua Zalo OA khi gần hết hạn.',
  },
  {
    cauHoi: 'Gửi thông báo nhắc việc cho thôn bằng cách nào?',
    traLoi: 'Vào mục "Thông Báo", tạo thông báo mới, chọn đối tượng nhận (tất cả thôn hoặc thôn cụ thể). Thông báo sẽ hiện trên web và đồng thời gửi qua Zalo OA.',
  },
  {
    cauHoi: 'Dữ liệu tổng hợp có chính xác không?',
    traLoi: 'Dữ liệu được tổng hợp tự động từ kê khai của dân và báo cáo của thôn. Hệ thống AI sẽ kiểm tra dữ liệu bất thường, thiếu hoặc sai định dạng và cảnh báo để bạn rà soát.',
  },
  {
    cauHoi: 'Quên mật khẩu cán bộ xã thì làm sao?',
    traLoi: 'Vào mục "Cài đặt" → "Thay đổi mật khẩu" để đặt mật khẩu mới. Nếu không đăng nhập được, hãy liên hệ quản trị viên hệ thống hoặc gọi số hotline 0236 3846 789.',
  },
  {
    cauHoi: 'Có thể tạo nhiệm vụ đột xuất ngoài kê khai định kỳ không?',
    traLoi: 'Có. Ngoài kê khai định kỳ theo quý, bạn có thể tạo nhiệm vụ đột xuất bất kỳ lúc nào (ví dụ: rà soát hộ nghèo, kiểm tra bạo lực gia đình). Vào "Nhiệm Vụ Báo Cáo" → "Tạo đợt mới" và chọn loại "Đột xuất".',
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
