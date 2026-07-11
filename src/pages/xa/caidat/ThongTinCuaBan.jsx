import { User, Phone, Shield } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

export default function ThongTinCuaBan() {
  const { nguoiDung } = useAuth()

  const thongTin = [
    { nhan: 'Họ và tên', giaTri: nguoiDung?.ho_ten || '', icon: User },
    { nhan: 'Số điện thoại', giaTri: nguoiDung?.so_dien_thoai || '', icon: Phone },
    { nhan: 'Vai trò', giaTri: 'Cán bộ xã', icon: Shield },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Thông Tin Của Bạn</h1>
        <p className="text-slate-500 mt-1">Xem thông tin cá nhân của bạn trên hệ thống</p>
      </div>

      <div className="p-8">
        <div className="space-y-1">
          {thongTin.map((dong, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <dong.icon size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">{dong.nhan}</p>
                <p className="text-base font-medium text-slate-800 mt-0.5">{dong.giaTri}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
