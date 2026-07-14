import { useState } from 'react'
import { Lock, Eye, EyeOff, Save, Loader2, KeyRound, MessageSquare } from 'lucide-react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'

export default function DoiMatKhau() {
  const { nguoiDung } = useAuth()
  const coMatKhau = nguoiDung?.co_mat_khau

  const [matKhauCu, setMatKhauCu] = useState('')
  const [matKhauMoi, setMatKhauMoi] = useState('')
  const [xacNhan, setXacNhan] = useState('')
  const [hienMatKhauCu, setHienMatKhauCu] = useState(false)
  const [hienMatKhau, setHienMatKhau] = useState(false)
  const [hienXacNhan, setHienXacNhan] = useState(false)
  const [thongBao, setThongBao] = useState<any>(null)
  const [dangLuu, setDangLuu] = useState(false)

  // OTP mock states
  const [buocOtp, setBuocOtp] = useState<'chua' | 'da_gui' | 'da_xac_thuc'>('chua')
  const [maOtp, setMaOtp] = useState('')
  const [dangGuiOtp, setDangGuiOtp] = useState(false)

  const guiOtp = async () => {
    setDangGuiOtp(true)
    try {
      await api.post('/auth/dan/gui-otp')
      setBuocOtp('da_gui')
      setThongBao({ loai: 'thanhCong', noiDung: 'Đã gửi mã OTP. Nhập mã 123456 để xác thực.' })
      setTimeout(() => setThongBao(null), 5000)
    } catch (err: any) {
      setThongBao({ loai: 'loi', noiDung: err.message || 'Không thể gửi OTP' })
    } finally {
      setDangGuiOtp(false)
    }
  }

  const xacThucOtp = () => {
    if (maOtp !== '123456') {
      setThongBao({ loai: 'loi', noiDung: 'Mã OTP không đúng. Vui lòng nhập 123456.' })
      return
    }
    setBuocOtp('da_xac_thuc')
    setThongBao(null)
  }

  const xuLyDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault()

    if (matKhauMoi.length < 6) {
      setThongBao({ loai: 'loi', noiDung: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
      return
    }
    if (matKhauMoi !== xacNhan) {
      setThongBao({ loai: 'loi', noiDung: 'Mật khẩu xác nhận không khớp' })
      return
    }

    setDangLuu(true)
    try {
      if (coMatKhau) {
        if (!matKhauCu) {
          setThongBao({ loai: 'loi', noiDung: 'Vui lòng nhập mật khẩu cũ' })
          setDangLuu(false)
          return
        }
        await api.patch('/auth/doi-mat-khau', { mat_khau_cu: matKhauCu, mat_khau_moi: matKhauMoi })
        setThongBao({ loai: 'thanhCong', noiDung: 'Đã đổi mật khẩu thành công!' })
      } else {
        await api.patch('/auth/dan/dat-mat-khau', { mat_khau_moi: matKhauMoi })
        setThongBao({ loai: 'thanhCong', noiDung: 'Đã thiết lập mật khẩu thành công! Lần sau bạn có thể đăng nhập bằng mật khẩu.' })
      }
      setMatKhauCu('')
      setMatKhauMoi('')
      setXacNhan('')
      setTimeout(() => setThongBao(null), 5000)
    } catch (err: any) {
      setThongBao({ loai: 'loi', noiDung: err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.' })
    } finally {
      setDangLuu(false)
    }
  }

  // Chua co mat khau - can OTP truoc
  if (!coMatKhau && buocOtp !== 'da_xac_thuc') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 md:px-8 py-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">Thiết Lập Mật Khẩu</h1>
          <p className="text-slate-500 mt-1">Tạo mật khẩu để đăng nhập nhanh hơn (thay vì OTP)</p>
        </div>

        <div className="p-4 md:p-8 max-w-lg">
          {buocOtp === 'chua' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center">
                <KeyRound size={28} className="text-blue-600" />
              </div>
              <p className="text-slate-600">Bạn chưa thiết lập mật khẩu. Xác thực OTP để bắt đầu thiết lập.</p>
              <button
                onClick={guiOtp}
                disabled={dangGuiOtp}
                className="mx-auto flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all disabled:opacity-60"
              >
                {dangGuiOtp ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                {dangGuiOtp ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </div>
          )}

          {buocOtp === 'da_gui' && (
            <div className="space-y-4">
              <p className="text-slate-600">Nhập mã OTP đã được gửi:</p>
              <input
                type="text"
                value={maOtp}
                onChange={(e) => { setMaOtp(e.target.value); setThongBao(null) }}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="------"
              />
              <button
                onClick={xacThucOtp}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
              >
                Xác thực
              </button>
            </div>
          )}

          {thongBao && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${thongBao.loai === 'thanhCong' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {thongBao.noiDung}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 md:px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">{coMatKhau ? 'Đổi Mật Khẩu' : 'Thiết Lập Mật Khẩu'}</h1>
        <p className="text-slate-500 mt-1">{coMatKhau ? 'Thay đổi mật khẩu tài khoản của bạn' : 'Tạo mật khẩu mới cho tài khoản'}</p>
      </div>

      <form onSubmit={xuLyDoiMatKhau} className="p-4 md:p-8 max-w-lg">
        <div className="space-y-6">
          {coMatKhau && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu cũ</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={18} /></div>
                <input
                  type={hienMatKhauCu ? 'text' : 'password'}
                  value={matKhauCu}
                  onChange={(e) => { setMatKhauCu(e.target.value); setThongBao(null) }}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu cũ"
                />
                <button type="button" onClick={() => setHienMatKhauCu(!hienMatKhauCu)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {hienMatKhauCu ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={18} /></div>
              <input
                type={hienMatKhau ? 'text' : 'password'}
                value={matKhauMoi}
                onChange={(e) => { setMatKhauMoi(e.target.value); setThongBao(null) }}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập mật khẩu mới"
              />
              <button type="button" onClick={() => setHienMatKhau(!hienMatKhau)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {hienMatKhau ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">Tối thiểu 6 ký tự</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={18} /></div>
              <input
                type={hienXacNhan ? 'text' : 'password'}
                value={xacNhan}
                onChange={(e) => { setXacNhan(e.target.value); setThongBao(null) }}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button type="button" onClick={() => setHienXacNhan(!hienXacNhan)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {hienXacNhan ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {thongBao && (
          <div className={`mt-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${thongBao.loai === 'thanhCong' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {thongBao.noiDung}
          </div>
        )}

        <button
          type="submit"
          disabled={dangLuu}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] active:shadow-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {dangLuu ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {dangLuu ? 'Đang lưu...' : (coMatKhau ? 'Đổi mật khẩu' : 'Thiết lập mật khẩu')}
        </button>
      </form>
    </div>
  )
}
