import { useState, useRef, useEffect } from 'react'
import { Mail, Phone, Send, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react'

function OtpInput({ value, onChange, onComplete }) {
  const inputRefs = useRef([])
  const [focusIdx, setFocusIdx] = useState(-1)

  const xuLyNhap = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const maMoi = [...value]
    maMoi[idx] = val[0]
    onChange(maMoi)
    if (idx < 5) {
      inputRefs.current[idx + 1]?.focus()
    }
    if (maMoi.every((v) => v !== '') && maMoi.length === 6) {
      onComplete(maMoi.join(''))
    }
  }

  const xuLyXoa = (e, idx) => {
    if (e.key === 'Backspace') {
      const maMoi = [...value]
      if (maMoi[idx]) {
        maMoi[idx] = ''
        onChange(maMoi)
      } else if (idx > 0) {
        maMoi[idx - 1] = ''
        onChange(maMoi)
        inputRefs.current[idx - 1]?.focus()
      }
    }
  }

  const xuLyDan = (e) => {
    e.preventDefault()
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!data) return
    const maMoi = Array(6).fill('')
    data.split('').forEach((c, i) => { maMoi[i] = c })
    onChange(maMoi)
    const viTriFocus = Math.min(data.length, 5)
    inputRefs.current[viTriFocus]?.focus()
    if (data.length === 6) {
      onComplete(data)
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {Array(6).fill('').map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => xuLyNhap(e, i)}
          onKeyDown={(e) => xuLyXoa(e, i)}
          onPaste={xuLyDan}
          onFocus={() => setFocusIdx(i)}
          onBlur={() => setFocusIdx(-1)}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200
            ${value[i]
              ? 'border-blue-400 bg-blue-50 text-slate-800'
              : focusIdx === i
                ? 'border-blue-500 bg-white shadow-md shadow-blue-500/20'
                : 'border-slate-200 bg-slate-50 text-slate-800'
            }`}
        />
      ))}
    </div>
  )
}

function kiemTraEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function kiemTraSdt(sdt) {
  return /^0\d{9}$/.test(sdt)
}

function KhoiXacThuc({ loai, icon: Icon, mauIcon, mauBg, tieuDe, moTa, placeholder }) {
  const [giaTri, setGiaTri] = useState('')
  const [buoc, setBuoc] = useState('nhap')
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [demNguoc, setDemNguoc] = useState(0)
  const [dangXacThuc, setDangXacThuc] = useState(false)
  const [daXacThuc, setDaXacThuc] = useState(false)
  const [loiNhapLieu, setLoiNhapLieu] = useState('')

  const hopLe = loai === 'email' ? kiemTraEmail(giaTri) : kiemTraSdt(giaTri)

  useEffect(() => {
    if (demNguoc <= 0) return
    const timer = setTimeout(() => setDemNguoc(demNguoc - 1), 1000)
    return () => clearTimeout(timer)
  }, [demNguoc])

  const xuLyNhapGiaTri = (e) => {
    let val = e.target.value
    if (loai === 'sdt') {
      val = val.replace(/\D/g, '').slice(0, 10)
    }
    setGiaTri(val)
    setLoiNhapLieu('')
  }

  const guiOtp = () => {
    if (!giaTri) return
    if (!hopLe) {
      setLoiNhapLieu(loai === 'email' ? 'Email không hợp lệ (ví dụ: abc@gmail.com)' : 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0')
      return
    }
    setBuoc('otp')
    setOtp(Array(6).fill(''))
    setDemNguoc(60)
    setDaXacThuc(false)
  }

  const xacThuc = () => {
    setDangXacThuc(true)
    setTimeout(() => {
      setDangXacThuc(false)
      setDaXacThuc(true)
      setBuoc('thanhCong')
    }, 1500)
  }

  const quayLai = () => {
    setBuoc('nhap')
    setOtp(Array(6).fill(''))
    setDaXacThuc(false)
  }

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${
      daXacThuc ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-11 h-11 ${mauBg} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={mauIcon} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{tieuDe}</p>
          <p className="text-xs text-slate-400 mt-0.5">{moTa}</p>
        </div>
        {daXacThuc && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">Đã xác thực</span>
          </div>
        )}
      </div>

      {buoc === 'nhap' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type={loai === 'sdt' ? 'tel' : 'text'}
              value={giaTri}
              onChange={xuLyNhapGiaTri}
              className={`flex-1 px-4 py-3 rounded-xl border text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent transition-all
                ${loiNhapLieu ? 'border-red-300 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'}`}
              placeholder={placeholder}
              maxLength={loai === 'sdt' ? 10 : undefined}
            />
            <button
              onClick={guiOtp}
              disabled={!giaTri || !hopLe}
              className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold whitespace-nowrap
                hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25
                active:translate-y-0 active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                transition-all duration-300"
            >
              <Send size={16} />
              Gửi mã OTP
            </button>
          </div>
          {loiNhapLieu && (
            <p className="text-red-500 text-xs font-medium pl-1">{loiNhapLieu}</p>
          )}
          {giaTri && !hopLe && !loiNhapLieu && (
            <p className="text-slate-400 text-xs pl-1">
              {loai === 'email' ? 'Email phải có dạng abc@domain.com' : `Cần nhập đủ 10 số (${giaTri.length}/10)`}
            </p>
          )}
        </div>
      )}

      {buoc === 'otp' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button
              onClick={quayLai}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <p className="text-sm text-slate-500">
              Mã OTP đã gửi đến <span className="font-semibold text-slate-700">{giaTri}</span>
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} onComplete={xacThuc} />

          {dangXacThuc && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Đang xác thực...</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={xacThuc}
              disabled={otp.some((v) => !v) || dangXacThuc}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold
                hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/25
                active:translate-y-0 active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                transition-all duration-300"
            >
              <ShieldCheck size={16} />
              Xác thực
            </button>

            <div className="text-right">
              {demNguoc > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-400">Gửi lại sau <span className="font-semibold text-blue-600">{demNguoc}s</span></p>
                  <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(demNguoc / 60) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={guiOtp}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {buoc === 'thanhCong' && (
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            <span className="text-sm font-medium text-green-700">{giaTri}</span>
          </div>
          <button
            onClick={quayLai}
            className="text-sm text-slate-500 hover:text-slate-700 hover:underline transition-all"
          >
            Đổi {loai === 'email' ? 'email' : 'số điện thoại'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function XacThucTaiKhoan() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Xác Thực Tài Khoản</h1>
        <p className="text-slate-500 mt-1">Xác thực email và số điện thoại bằng mã OTP</p>
      </div>

      <div className="p-8 space-y-6">
        <KhoiXacThuc
          loai="email"
          icon={Mail}
          mauIcon="text-blue-600"
          mauBg="bg-blue-50"
          tieuDe="Xác thực qua Email"
          moTa="Mã OTP gồm 6 chữ số sẽ được gửi về email của bạn"
          placeholder="Nhập địa chỉ email"
        />

        <KhoiXacThuc
          loai="sdt"
          icon={Phone}
          mauIcon="text-green-600"
          mauBg="bg-green-50"
          tieuDe="Xác thực qua Số điện thoại"
          moTa="Mã OTP gồm 6 chữ số sẽ được gửi qua tin nhắn SMS"
          placeholder="Nhập số điện thoại"
        />
      </div>
    </div>
  )
}
