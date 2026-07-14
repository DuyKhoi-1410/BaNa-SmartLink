import { useState, useEffect, useRef } from 'react'
import { Save, X, Loader2, Camera, User } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { api } from '../../../lib/api'

export default function ChinhSuaThongTin() {
  const { nguoiDung, capNhatNguoiDung } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const layGiaTriGoc = () => ({
    hoTen: nguoiDung?.ho_ten || '',
  })

  const [form, setForm] = useState(layGiaTriGoc)
  const [thongBao, setThongBao] = useState<any>(null)
  const [dangLuu, setDangLuu] = useState(false)
  const [dangUpload, setDangUpload] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (nguoiDung) setForm(layGiaTriGoc())
  }, [nguoiDung])

  const xuLyThayDoi = (truong: string, giaTri: string) => {
    setForm({ ...form, [truong]: giaTri })
    setThongBao(null)
  }

  const xuLyLuu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.hoTen.trim() || form.hoTen.trim().length < 2) {
      setThongBao({ loai: 'loi', noiDung: 'Họ tên phải có ít nhất 2 ký tự' })
      return
    }

    setDangLuu(true)
    try {
      const result = await api.patch('/auth/me', { ho_ten: form.hoTen.trim() })
      capNhatNguoiDung(result.user)
      setThongBao({ loai: 'thanhCong', noiDung: 'Đã lưu thông tin thành công!' })
      setTimeout(() => setThongBao(null), 3000)
    } catch (err: any) {
      setThongBao({ loai: 'loi', noiDung: err.message || 'Không thể lưu thông tin' })
    } finally {
      setDangLuu(false)
    }
  }

  const xuLyChonAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setThongBao({ loai: 'loi', noiDung: 'Chỉ chấp nhận ảnh JPG, PNG hoặc WebP' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setThongBao({ loai: 'loi', noiDung: 'Ảnh không được vượt quá 5MB' })
      return
    }

    setPreviewAvatar(URL.createObjectURL(file))
    setDangUpload(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const result = await api.upload('/auth/me/avatar', formData)
      capNhatNguoiDung(result.user)
      setThongBao({ loai: 'thanhCong', noiDung: 'Đã cập nhật ảnh đại diện!' })
      setTimeout(() => setThongBao(null), 3000)
    } catch (err: any) {
      setPreviewAvatar(null)
      setThongBao({ loai: 'loi', noiDung: err.message || 'Không thể upload ảnh' })
    } finally {
      setDangUpload(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const avatarSrc = previewAvatar || nguoiDung?.avatar_url

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 md:px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Chỉnh Sửa Thông Tin</h1>
        <p className="text-slate-500 mt-1">Cập nhật thông tin cá nhân của bạn</p>
      </div>

      <form onSubmit={xuLyLuu} className="p-4 md:p-8">
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={dangUpload}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors disabled:opacity-60"
              >
                {dangUpload ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={xuLyChonAvatar} className="hidden" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Ảnh đại diện</p>
              <p className="text-xs text-slate-400 mt-0.5">JPG, PNG hoặc WebP. Tối đa 5MB</p>
            </div>
          </div>

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

        {thongBao && (
          <div className={`mt-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${thongBao.loai === 'thanhCong' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {thongBao.noiDung}
          </div>
        )}

        <div className="flex items-center gap-4 mt-8">
          <button
            type="submit"
            disabled={dangLuu}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] active:shadow-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {dangLuu ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {dangLuu ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
          <button
            type="button"
            onClick={() => { setForm(layGiaTriGoc()); setThongBao(null) }}
            className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] transition-all duration-300"
          >
            <X size={18} />
            Hủy thay đổi
          </button>
        </div>
      </form>
    </div>
  )
}
