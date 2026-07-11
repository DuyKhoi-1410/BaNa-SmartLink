import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CreditCard, Send, Lock, LogIn, ArrowLeft, Eye, EyeOff, Users, ShieldCheck } from 'lucide-react'
import anhNen from '../assets/cauvang1k.jpg'
import logoIcon from '../assets/LOGO.png'
import logoChu from '../assets/CHỮ.PNG'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function TrangDangNhap() {
  const navigate = useNavigate()
  const { dangNhap } = useAuth()
  const [vaiTro, setVaiTro] = useState(null)
  const [userId, setUserId] = useState(null)

  // --- Dân ---
  const [buocDan, setBuocDan] = useState(1)
  const [cccd, setCccd] = useState('')
  const [hoTen, setHoTen] = useState('')
  const [otp, setOtp] = useState('')
  const [dangXacThuc, setDangXacThuc] = useState(false)
  const [dangGuiOtp, setDangGuiOtp] = useState(false)
  const [sdtDaChe, setSdtDaChe] = useState('')
  const [loiDan, setLoiDan] = useState('')
  const [phuongThucDan, setPhuongThucDan] = useState('otp')
  const [matKhauDan, setMatKhauDan] = useState('')
  const [hienMatKhauDan, setHienMatKhauDan] = useState(false)
  const [buocQuenMK, setBuocQuenMK] = useState(0)
  const [matKhauMoi, setMatKhauMoi] = useState('')
  const [xacNhanMKMoi, setXacNhanMKMoi] = useState('')
  const [hienMKMoi, setHienMKMoi] = useState(false)
  const [hienXacNhanMK, setHienXacNhanMK] = useState(false)
  const [doiMKThanhCong, setDoiMKThanhCong] = useState(false)

  const [demNguoc, setDemNguoc] = useState(0)

  useEffect(() => {
    if (demNguoc <= 0) return
    const timer = setTimeout(() => setDemNguoc(demNguoc - 1), 1000)
    return () => clearTimeout(timer)
  }, [demNguoc])

  // --- Cán bộ ---
  const [tenDangNhap, setTenDangNhap] = useState('')
  const [matKhau, setMatKhau] = useState('')
  const [hienMatKhau, setHienMatKhau] = useState(false)
  const [dangDangNhap, setDangDangNhap] = useState(false)
  const [loiCanBo, setLoiCanBo] = useState('')

  const quayLaiChonVaiTro = () => {
    setVaiTro(null)
    setBuocDan(1)
    setBuocQuenMK(0)
    setLoiDan('')
    setLoiCanBo('')
    setCccd('')
    setHoTen('')
    setOtp('')
    setMatKhauDan('')
    setPhuongThucDan('otp')
    
    setTenDangNhap('')
    setMatKhau('')
  }

  const xuLyBuoc1Dan = async (e) => {
    e.preventDefault()
    if (!cccd.trim() || !hoTen.trim()) {
      setLoiDan('Vui lòng nhập đầy đủ số CCCD và họ tên')
      return
    }
    if (!/^\d{12}$/.test(cccd.trim())) {
      setLoiDan('Số CCCD phải gồm đúng 12 chữ số')
      return
    }
    if (!/^[a-zA-ZÀ-ỹà-ỹĂăÂâĐđÊêÔôƠơƯư\s]+$/.test(hoTen.trim())) {
      setLoiDan('Họ tên chỉ được chứa chữ cái, không nhập số hay ký tự đặc biệt')
      return
    }
    setLoiDan('')
    setDangXacThuc(true)
    try {
      const res = await api.post('/auth/dan/xac-minh', { cccd: cccd.trim(), ho_ten: hoTen.trim() })
      setUserId(res.user_id)
      setSdtDaChe(res.sdt_masked || '***')
      setBuocDan(2)
    } catch (err) {
      setLoiDan(err.error || 'Không tìm thấy thông tin. Vui lòng kiểm tra lại CCCD và họ tên.')
    } finally {
      setDangXacThuc(false)
    }
  }

  const xuLyGuiOtpDangNhap = async () => {
    setDangGuiOtp(true)
    setLoiDan('')
    try {
      // TODO: Gọi API gửi OTP thật qua Zalo khi có gateway
      await new Promise(r => setTimeout(r, 800))
      setBuocDan(3)
      setDemNguoc(60)
    } catch (err) {
      setLoiDan('Không thể gửi OTP. Vui lòng thử lại.')
    } finally {
      setDangGuiOtp(false)
    }
  }

  const xuLyXacThucOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 6) {
      setLoiDan('Vui lòng nhập mã OTP 6 số')
      return
    }
    setLoiDan('')
    setDangXacThuc(true)
    try {
      const res = await api.post('/auth/dan/otp', { user_id: userId })
      dangNhap(res.token, res.user)
      navigate('/dan')
    } catch (err) {
      setLoiDan(err.error || 'Xác thực thất bại. Vui lòng thử lại.')
    } finally {
      setDangXacThuc(false)
    }
  }

  const [otpQuenMK, setOtpQuenMK] = useState('')
  const [dangGuiOtpQuenMK, setDangGuiOtpQuenMK] = useState(false)
  const [demNguocQuenMK, setDemNguocQuenMK] = useState(0)

  useEffect(() => {
    if (demNguocQuenMK <= 0) return
    const timer = setTimeout(() => setDemNguocQuenMK(demNguocQuenMK - 1), 1000)
    return () => clearTimeout(timer)
  }, [demNguocQuenMK])

  const xuLyBatDauQuenMK = () => {
    setLoiDan('')
    
    setOtpQuenMK('')
    setMatKhauMoi('')
    setXacNhanMKMoi('')
    setBuocQuenMK(1)
  }

  const xuLyGuiOtpQuenMK = async () => {
    setDangGuiOtpQuenMK(true)
    setLoiDan('')
    try {
      // TODO: Gọi API gửi OTP thật qua Zalo khi có gateway
      await new Promise(r => setTimeout(r, 800))
      setBuocQuenMK(2)
      setDemNguocQuenMK(60)
    } catch (err) {
      setLoiDan('Không thể gửi OTP. Vui lòng thử lại.')
    } finally {
      setDangGuiOtpQuenMK(false)
    }
  }

  const xuLyDatMatKhauMoi = async (e) => {
    e.preventDefault()
    if (!matKhauMoi.trim()) {
      setLoiDan('Vui lòng nhập mật khẩu mới')
      return
    }
    if (matKhauMoi.length < 6) {
      setLoiDan('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (matKhauMoi !== xacNhanMKMoi) {
      setLoiDan('Mật khẩu xác nhận không khớp')
      return
    }
    setLoiDan('')
    setDangXacThuc(true)
    try {
      await api.post('/auth/dan/dat-lai-mat-khau', {
        user_id: userId,
        mat_khau_moi: matKhauMoi,
      })
      setDoiMKThanhCong(true)
      setTimeout(() => {
        setBuocQuenMK(0)
        setDoiMKThanhCong(false)
        
        setOtpQuenMK('')
        setMatKhauMoi('')
        setXacNhanMKMoi('')
        setPhuongThucDan('matkhau')
      }, 2000)
    } catch (err) {
      setLoiDan(err.error || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra thông tin.')
    } finally {
      setDangXacThuc(false)
    }
  }

  const xuLyDangNhapMatKhauDan = async (e) => {
    e.preventDefault()
    if (!matKhauDan.trim()) {
      setLoiDan('Vui lòng nhập mật khẩu')
      return
    }
    setLoiDan('')
    setDangXacThuc(true)
    try {
      const res = await api.post('/auth/dan/mat-khau', { cccd: cccd.trim(), mat_khau: matKhauDan })
      dangNhap(res.token, res.user)
      navigate('/dan')
    } catch (err) {
      setLoiDan(err.error || 'Mật khẩu không đúng. Vui lòng thử lại.')
    } finally {
      setDangXacThuc(false)
    }
  }

  const xuLyDangNhapCanBo = async (e) => {
    e.preventDefault()
    if (!tenDangNhap.trim() || !matKhau.trim()) {
      setLoiCanBo('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu')
      return
    }
    setLoiCanBo('')
    setDangDangNhap(true)
    try {
      const res = await api.post('/auth/can-bo', { ten_dang_nhap: tenDangNhap.trim(), mat_khau: matKhau })
      dangNhap(res.token, res.user)
      if (res.user.vai_tro === 'xa') navigate('/xa')
      else if (res.user.vai_tro === 'thon') navigate('/thon')
      else navigate('/')
    } catch (err) {
      setLoiCanBo(err.error || 'Tên đăng nhập hoặc mật khẩu không đúng.')
    } finally {
      setDangDangNhap(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 z-0">
        <img src={anhNen} alt="Cầu Vàng Bà Nà" className="fixed inset-0 w-full h-full object-cover object-[70%_center] md:object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-10">
        <div className="mb-6 md:mb-10 text-center">
          <img src={logoIcon} alt="Logo Ba Na" className="h-20 md:h-28 mx-auto mb-3 md:mb-4 object-contain drop-shadow-lg" />
          <img src={logoChu} alt="Ba Na SmartLink" className="h-10 md:h-14 mx-auto mb-2 md:mb-3 object-contain drop-shadow-lg" />
          <p className="text-white/80 text-sm md:text-lg tracking-wide">Nền tảng số hóa báo cáo xã — thôn</p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mt-4" />
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl shadow-black/20 p-5 md:p-8 border border-white/50">
            {/* ===== CHỌN VAI TRÒ ===== */}
            {vaiTro === null && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
                    <LogIn size={22} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Đăng nhập hệ thống</h3>
                  <p className="text-slate-400 text-sm mt-1.5">Vui lòng cho biết bạn là ai</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setVaiTro('dan')}
                    className="group w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 border-slate-200 bg-white
                      hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10
                      transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-sky-400 rounded-xl flex items-center justify-center flex-shrink-0
                      shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow duration-300">
                      <Users size={26} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-base font-bold text-slate-800">Người dân</p>
                      <p className="text-xs text-slate-400 mt-0.5">Chủ hộ kê khai dữ liệu gia đình</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0
                      group-hover:bg-blue-100 transition-colors duration-300">
                      <ArrowLeft size={16} className="text-slate-400 rotate-180 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                  </button>

                  <button
                    onClick={() => setVaiTro('canbo')}
                    className="group w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 border-slate-200 bg-white
                      hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10
                      transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0
                      shadow-md shadow-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-shadow duration-300">
                      <ShieldCheck size={26} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-base font-bold text-slate-800">Cán bộ</p>
                      <p className="text-xs text-slate-400 mt-0.5">Cán bộ thôn hoặc cán bộ xã</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0
                      group-hover:bg-indigo-100 transition-colors duration-300">
                      <ArrowLeft size={16} className="text-slate-400 rotate-180 group-hover:text-indigo-600 transition-colors duration-300" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ===== FORM NGƯỜI DÂN ===== */}
            {vaiTro === 'dan' && (
              <div>
                {/* Bước 1: CCCD + Họ tên */}
                {buocDan === 1 && (
                  <form onSubmit={xuLyBuoc1Dan} className="space-y-4">
                    <button type="button" onClick={quayLaiChonVaiTro} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-1">
                      <ArrowLeft size={16} /> Quay lại
                    </button>
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-slate-800">Xác minh thông tin</h3>
                      <p className="text-slate-500 text-sm mt-0.5">Nhập đúng thông tin trên căn cước công dân</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số CCCD</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={12}
                          value={cccd}
                          onChange={(e) => setCccd(e.target.value.replace(/\D/g, ''))}
                          placeholder="Nhập 12 số trên CCCD"
                          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên chủ hộ</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={hoTen}
                          onChange={(e) => setHoTen(e.target.value)}
                          placeholder="Nhập đúng họ tên trong CCCD"
                          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {loiDan && <p className="text-red-500 text-sm font-medium">{loiDan}</p>}

                    <button
                      type="submit"
                      disabled={dangXacThuc}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-300 ease-out hover:from-blue-400 hover:to-indigo-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {dangXacThuc ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xác thực...</>
                      ) : (
                        <>Tiếp tục</>
                      )}
                    </button>
                  </form>
                )}

                {/* Bước 2: Hiện SĐT che + nút gửi OTP hoặc chọn mật khẩu */}
                {buocDan === 2 && phuongThucDan === 'otp' && buocQuenMK === 0 && (
                  <div className="space-y-4">
                    <button type="button" onClick={() => { setBuocDan(1); setLoiDan('') }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-1">
                      <ArrowLeft size={16} /> Quay lại
                    </button>
                    <div className="bg-blue-50 rounded-xl px-4 py-4 text-sm text-blue-700">
                      <p>Xin chào <span className="font-bold">{hoTen}</span></p>
                      <p className="mt-1">Số điện thoại đăng ký:</p>
                      <p className="text-2xl font-bold text-blue-800 mt-2 tracking-wider text-center">{sdtDaChe}</p>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Bấm nút bên dưới để nhận mã OTP qua Zalo
                    </p>

                    {loiDan && <p className="text-red-500 text-sm font-medium">{loiDan}</p>}

                    <button
                      onClick={xuLyGuiOtpDangNhap}
                      disabled={dangGuiOtp}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-300 ease-out hover:from-blue-400 hover:to-indigo-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {dangGuiOtp ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>
                      ) : (
                        <><Send size={18} /> Gửi mã OTP qua Zalo</>
                      )}
                    </button>

                    <div className="relative flex items-center my-1">
                      <div className="flex-1 border-t border-slate-200" />
                      <span className="px-3 text-xs text-slate-400">hoặc</span>
                      <div className="flex-1 border-t border-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={() => { setPhuongThucDan('matkhau'); setLoiDan('') }}
                      className="w-full py-3 border border-slate-200 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-colors"
                    >
                      <Lock size={16} /> Đăng nhập bằng mật khẩu
                    </button>
                  </div>
                )}

                {buocDan === 2 && phuongThucDan === 'matkhau' && buocQuenMK === 0 && (
                  <form onSubmit={xuLyDangNhapMatKhauDan} className="space-y-4">
                    <button type="button" onClick={() => { setBuocDan(1); setLoiDan(''); setPhuongThucDan('otp') }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-1">
                      <ArrowLeft size={16} /> Quay lại
                    </button>
                    <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700">
                      Xin chào <span className="font-bold">{hoTen}</span>. Nhập mật khẩu để đăng nhập.
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type={hienMatKhauDan ? 'text' : 'password'}
                          value={matKhauDan}
                          onChange={(e) => setMatKhauDan(e.target.value)}
                          placeholder="Nhập mật khẩu"
                          className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setHienMatKhauDan(!hienMatKhauDan)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {hienMatKhauDan ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {loiDan && <p className="text-red-500 text-sm font-medium">{loiDan}</p>}

                    <button
                      type="submit"
                      disabled={dangXacThuc}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-300 ease-out hover:from-blue-400 hover:to-indigo-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {dangXacThuc ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang đăng nhập...</>
                      ) : (
                        <><LogIn size={18} /> Đăng nhập</>
                      )}
                    </button>

                    <div className="relative flex items-center my-1">
                      <div className="flex-1 border-t border-slate-200" />
                      <span className="px-3 text-xs text-slate-400">hoặc</span>
                      <div className="flex-1 border-t border-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={() => { setPhuongThucDan('otp'); setLoiDan(''); setMatKhauDan('') }}
                      className="w-full py-3 border border-slate-200 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-colors"
                    >
                      <Send size={16} /> Đăng nhập bằng OTP Zalo
                    </button>

                    <button
                      type="button"
                      onClick={xuLyBatDauQuenMK}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-1"
                    >
                      Quên mật khẩu?
                    </button>
                  </form>
                )}

                {/* Quên mật khẩu — Bước 1: Hiện SĐT đã che + nút gửi OTP */}
                {buocQuenMK === 1 && (
                  <div className="space-y-4">
                    <button type="button" onClick={() => { setBuocQuenMK(0); setLoiDan('') }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-1">
                      <ArrowLeft size={16} /> Quay lại đăng nhập
                    </button>
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-slate-800">Quên mật khẩu</h3>
                      <p className="text-slate-500 text-sm mt-0.5">Xác minh qua số điện thoại để đặt lại mật khẩu</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl px-4 py-4 text-sm text-blue-700">
                      <p>Số điện thoại đăng ký của <span className="font-bold">{hoTen}</span>:</p>
                      <p className="text-2xl font-bold text-blue-800 mt-2 tracking-wider text-center">{sdtDaChe}</p>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Hệ thống sẽ gửi mã OTP đến số điện thoại này qua Zalo
                    </p>

                    {loiDan && <p className="text-red-500 text-sm font-medium">{loiDan}</p>}

                    <button
                      onClick={xuLyGuiOtpQuenMK}
                      disabled={dangGuiOtpQuenMK}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-300 ease-out hover:from-blue-400 hover:to-indigo-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {dangGuiOtpQuenMK ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>
                      ) : (
                        <><Send size={18} /> Gửi mã OTP qua Zalo</>
                      )}
                    </button>
                  </div>
                )}

                {/* Quên mật khẩu — Bước 2: Nhập OTP + đặt mật khẩu mới */}
                {buocQuenMK === 2 && !doiMKThanhCong && (
                  <form onSubmit={xuLyDatMatKhauMoi} className="space-y-4">
                    <button type="button" onClick={() => { setBuocQuenMK(1); setLoiDan(''); setOtpQuenMK('') }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-1">
                      <ArrowLeft size={16} /> Quay lại
                    </button>
                    <div className="bg-emerald-50 rounded-xl px-4 py-3 text-sm text-emerald-700">
                      Mã OTP đã gửi qua <span className="font-bold">Zalo</span> đến số <span className="font-bold">{sdtDaChe}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nhập mã OTP (6 số)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpQuenMK}
                        onChange={(e) => setOtpQuenMK(e.target.value.replace(/\D/g, ''))}
                        placeholder="Nhập mã 6 số"
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 placeholder:text-base placeholder:tracking-normal text-slate-800 transition-all duration-200"
                      />
                    </div>

                    <div className="text-center text-sm">
                      {demNguocQuenMK > 0 ? (
                        <span className="text-slate-400">Gửi lại mã sau <span className="font-bold text-slate-600">{demNguocQuenMK}s</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { xuLyGuiOtpQuenMK(); setOtpQuenMK('') }}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Gửi lại mã OTP
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <p className="text-sm font-semibold text-slate-700">Đặt mật khẩu mới</p>
                      <div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type={hienMKMoi ? 'text' : 'password'}
                            value={matKhauMoi}
                            onChange={(e) => setMatKhauMoi(e.target.value)}
                            placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                            className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setHienMKMoi(!hienMKMoi)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {hienMKMoi ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type={hienXacNhanMK ? 'text' : 'password'}
                            value={xacNhanMKMoi}
                            onChange={(e) => setXacNhanMKMoi(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setHienXacNhanMK(!hienXacNhanMK)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {hienXacNhanMK ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {loiDan && <p className="text-red-500 text-sm font-medium">{loiDan}</p>}

                    <button
                      type="submit"
                      disabled={dangXacThuc}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-300 ease-out hover:from-emerald-400 hover:to-teal-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {dangXacThuc ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                      ) : (
                        <>Đặt mật khẩu mới</>
                      )}
                    </button>
                  </form>
                )}

                {/* Quên mật khẩu — Thành công */}
                {doiMKThanhCong && (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-800">Đổi mật khẩu thành công!</p>
                    <p className="text-sm text-slate-500">Đang quay lại đăng nhập...</p>
                  </div>
                )}

                {/* Bước 3: Nhập OTP */}
                {buocDan === 3 && buocQuenMK === 0 && (
                  <form onSubmit={xuLyXacThucOtp} className="space-y-4">
                    <button type="button" onClick={() => { setBuocDan(2); setLoiDan(''); setOtp('') }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-1">
                      <ArrowLeft size={16} /> Quay lại
                    </button>
                    <div className="bg-emerald-50 rounded-xl px-4 py-3 text-sm text-emerald-700">
                      Mã OTP đã gửi qua <span className="font-bold">Zalo</span> đến số <span className="font-bold">{sdtDaChe}</span>. Vui lòng kiểm tra và nhập mã bên dưới.
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã OTP (6 số)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Nhập mã 6 số"
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 placeholder:text-base placeholder:tracking-normal text-slate-800 transition-all duration-200"
                      />
                    </div>

                    {loiDan && <p className="text-red-500 text-sm font-medium">{loiDan}</p>}

                    <button
                      type="submit"
                      disabled={dangXacThuc}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-300 ease-out hover:from-emerald-400 hover:to-teal-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {dangXacThuc ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xác thực...</>
                      ) : (
                        <><LogIn size={18} /> Đăng nhập</>
                      )}
                    </button>

                    <div className="text-center text-sm">
                      {demNguoc > 0 ? (
                        <span className="text-slate-400">Gửi lại mã sau <span className="font-bold text-slate-600">{demNguoc}s</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { xuLyGuiOtpDangNhap(); setOtp('') }}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Gửi lại mã OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ===== FORM CÁN BỘ ===== */}
            {vaiTro === 'canbo' && (
              <form onSubmit={xuLyDangNhapCanBo} className="space-y-4">
                <button type="button" onClick={quayLaiChonVaiTro} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-1">
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Đăng nhập cán bộ</h3>
                  <p className="text-slate-500 text-sm mt-0.5">Dành cho cán bộ thôn và cán bộ xã</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={tenDangNhap}
                      onChange={(e) => setTenDangNhap(e.target.value)}
                      placeholder="Nhập tên đăng nhập được cấp"
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={hienMatKhau ? 'text' : 'password'}
                      value={matKhau}
                      onChange={(e) => setMatKhau(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setHienMatKhau(!hienMatKhau)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {hienMatKhau ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {loiCanBo && <p className="text-red-500 text-sm font-medium">{loiCanBo}</p>}

                <button
                  type="submit"
                  disabled={dangDangNhap}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-300 ease-out hover:from-blue-400 hover:to-indigo-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {dangDangNhap ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang đăng nhập...</>
                  ) : (
                    <><LogIn size={18} /> Đăng nhập</>
                  )}
                </button>

                <button type="button" className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2">
                  Quên mật khẩu?
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-white/50 text-sm mt-8">
            © 2025 UBND Xã Bà Nà · Tp. Đà Nẵng
          </p>
        </div>
      </div>
    </div>
  )
}
