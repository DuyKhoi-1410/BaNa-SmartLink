import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

export default function ChinhSuaThongTin() {
  const { nguoiDung } = useAuth()
  const [form, setForm] = useState({
    hoTen: nguoiDung?.ho_ten || '',
  })
  const [daLuu, setDaLuu] = useState(false)

  const xuLyThayDoi = (truong, giaTri) => {
    setForm({ ...form, [truong]: giaTri })
    setDaLuu(false)
  }

  const xuLyLuu = (e) => {
    e.preventDefault()
    setDaLuu(true)
    setTimeout(() => setDaLuu(false), 3000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Chỉnh Sửa Thông Tin</h1>
        <p className="text-slate-500 mt-1">Cập nhật thông tin cá nhân của bạn</p>
      </div>

      <form onSubmit={xuLyLuu} className="p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
            <input
              type="text"
              value={form.hoTen}
              onChange={(e) => xuLyThayDoi('hoTen', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nhập họ và tên"
            />
          </div>
        </div>

        {daLuu && (
          <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Đã lưu thông tin thành công!
          </div>
        )}

        <div className="flex items-center gap-4 mt-8">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium
              hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg
              active:translate-y-0 active:scale-[0.98] active:shadow-sm
              transition-all duration-300"
          >
            <Save size={18} />
            Lưu thông tin
          </button>
          <button
            type="button"
            onClick={() => setForm({ hoTen: nguoiDung?.ho_ten || '' })}
            className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium
              hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md
              active:translate-y-0 active:scale-[0.98]
              transition-all duration-300"
          >
            <X size={18} />
            Hủy thay đổi
          </button>
        </div>
      </form>
    </div>
  )
}
