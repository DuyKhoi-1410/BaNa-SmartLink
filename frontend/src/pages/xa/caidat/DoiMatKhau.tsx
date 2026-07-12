import { useState } from 'react'
import { Lock, Eye, EyeOff, Save } from 'lucide-react'

export default function DoiMatKhau() {
  const [matKhauMoi, setMatKhauMoi] = useState('')
  const [xacNhan, setXacNhan] = useState('')
  const [hienMatKhau, setHienMatKhau] = useState(false)
  const [hienXacNhan, setHienXacNhan] = useState(false)
  const [thongBao, setThongBao] = useState(null)

  const xuLyDoiMatKhau = (e) => {
    e.preventDefault()

    if (matKhauMoi.length < 6) {
      setThongBao({ loai: 'loi', noiDung: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
      return
    }
    if (matKhauMoi !== xacNhan) {
      setThongBao({ loai: 'loi', noiDung: 'Mật khẩu xác nhận không khớp' })
      return
    }

    setThongBao({ loai: 'thanhCong', noiDung: 'Đã thay đổi mật khẩu thành công!' })
    setMatKhauMoi('')
    setXacNhan('')
    setTimeout(() => setThongBao(null), 3000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Thay Đổi Mật Khẩu</h1>
        <p className="text-slate-500 mt-1">Tạo mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <form onSubmit={xuLyDoiMatKhau} className="p-8 max-w-lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={hienMatKhau ? 'text' : 'password'}
                value={matKhauMoi}
                onChange={(e) => { setMatKhauMoi(e.target.value); setThongBao(null) }}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setHienMatKhau(!hienMatKhau)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {hienMatKhau ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">Tối thiểu 6 ký tự</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={hienXacNhan ? 'text' : 'password'}
                value={xacNhan}
                onChange={(e) => { setXacNhan(e.target.value); setThongBao(null) }}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setHienXacNhan(!hienXacNhan)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {hienXacNhan ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {thongBao && (
          <div className={`mt-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
            ${thongBao.loai === 'thanhCong'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {thongBao.loai === 'thanhCong' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {thongBao.noiDung}
          </div>
        )}

        <button
          type="submit"
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium
            hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg
            active:translate-y-0 active:scale-[0.98] active:shadow-sm
            transition-all duration-300"
        >
          <Save size={18} />
          Đổi mật khẩu
        </button>
      </form>
    </div>
  )
}
