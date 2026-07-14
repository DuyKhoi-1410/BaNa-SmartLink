import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, LogOut, Shield, Loader2 } from 'lucide-react'
import { api, tokenStore } from '../../../lib/api'

function thoiGianTuongDoi(date: string): string {
  const ms = Date.now() - new Date(date).getTime()
  const phut = Math.floor(ms / 60000)
  if (phut < 1) return 'Vừa mới'
  if (phut < 60) return `${phut} phút trước`
  const gio = Math.floor(phut / 60)
  if (gio < 24) return `${gio} giờ trước`
  const ngay = Math.floor(gio / 24)
  return `${ngay} ngày trước`
}

const layIcon = (loai: string) => {
  switch (loai) {
    case 'phone': return Smartphone
    case 'tablet': return Tablet
    default: return Monitor
  }
}

export default function QuanLyThietBi() {
  const [thietBis, setThietBis] = useState<any[]>([])
  const [phienHienTaiId, setPhienHienTaiId] = useState<number | null>(null)
  const [dangTai, setDangTai] = useState(true)
  const [dangXuatId, setDangXuatId] = useState<number | null>(null)
  const [dangXuatTatCa, setDangXuatTatCa] = useState(false)

  useEffect(() => {
    const refreshToken = tokenStore.getRefresh()
    api.post('/auth/sessions', { refresh_token: refreshToken })
      .then((res: any) => {
        setThietBis(res.sessions)
        setPhienHienTaiId(res.phien_hien_tai_id)
      })
      .catch(() => {})
      .finally(() => setDangTai(false))
  }, [])

  const dangXuatThietBi = async (id: number) => {
    setDangXuatId(id)
    try {
      await api.delete(`/auth/sessions/${id}`)
      setThietBis(prev => prev.filter(tb => tb.id !== id))
    } catch {
    } finally {
      setDangXuatId(null)
    }
  }

  const dangXuatTatCaKhac = async () => {
    setDangXuatTatCa(true)
    try {
      const refreshToken = tokenStore.getRefresh()
      await api.post('/auth/sessions/revoke-others', { refresh_token: refreshToken })
      setThietBis(prev => prev.filter(tb => tb.id === phienHienTaiId))
    } catch {
    } finally {
      setDangXuatTatCa(false)
    }
  }

  if (dangTai) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">Quản Lý Thiết Bị</h1>
          <p className="text-slate-500 mt-1">Các thiết bị đang đăng nhập vào tài khoản của bạn</p>
        </div>
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="ml-2 text-slate-500">Đang tải...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Quản Lý Thiết Bị</h1>
        <p className="text-slate-500 mt-1">Các thiết bị đang đăng nhập vào tài khoản của bạn</p>
      </div>

      <div className="p-8">
        {thietBis.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Không có phiên đăng nhập nào</p>
        ) : (
          <div className="space-y-4">
            {thietBis.map((tb) => {
              const Icon = layIcon(tb.loai)
              const laHienTai = tb.id === phienHienTaiId
              return (
                <div
                  key={tb.id}
                  className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${laHienTai ? 'bg-blue-50' : 'bg-slate-50'}`}>
                    <Icon size={22} className={laHienTai ? 'text-blue-600' : 'text-slate-500'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 truncate">{tb.ten}</p>
                      {laHienTai && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                          <Shield size={12} />
                          Thiết bị này
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {tb.ip_address || 'IP không rõ'} · {laHienTai ? 'Đang hoạt động' : thoiGianTuongDoi(tb.created_at)}
                    </p>
                  </div>

                  {!laHienTai && (
                    <button
                      onClick={() => dangXuatThietBi(tb.id)}
                      disabled={dangXuatId === tb.id}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 flex-shrink-0"
                    >
                      {dangXuatId === tb.id ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                      Đăng xuất
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {thietBis.length > 1 && (
          <button
            onClick={dangXuatTatCaKhac}
            disabled={dangXuatTatCa}
            className="mt-6 flex items-center gap-2 px-5 py-3 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-60"
          >
            {dangXuatTatCa ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            Đăng xuất tất cả thiết bị khác
          </button>
        )}
      </div>
    </div>
  )
}
