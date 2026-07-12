import { useEffect, useState, useCallback } from 'react'
import {
  Users, Search, Plus, Eye, LogOut as LogOutIcon, RotateCcw, X,
  ShieldCheck, MapPin, Phone, CreditCard, Home, Loader2, AlertCircle,
} from 'lucide-react'
import { api } from '../../lib/api'
import Toast from '../../components/Toast'

interface HoDanList {
  id: number
  ho_ten_chu_ho: string
  thon_id: number
  ten_thon: string
  trang_thai: 'dang_cu_tru' | 'da_roi'
  ngay_roi: string | null
}

interface HoDanDetail extends HoDanList {
  cccd: string
  so_dien_thoai: string
  dia_chi: string
  ly_do_roi: string | null
  ghi_chu: string | null
  nguoi_cap_nhat: string | null
}

export default function QuanLyHoDan() {
  const [danhSach, setDanhSach] = useState<HoDanList[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')
  const [timKiem, setTimKiem] = useState('')
  const [locThon, setLocThon] = useState('')
  const [locTrangThai, setLocTrangThai] = useState('')
  const [danhSachThon, setDanhSachThon] = useState<any[]>([])
  const [toast, setToast] = useState('')

  const [chiTiet, setChiTiet] = useState<HoDanDetail | null>(null)
  const [dangTaiChiTiet, setDangTaiChiTiet] = useState(false)
  const [hienThemHo, setHienThemHo] = useState(false)

  const taiDanhSach = useCallback(async () => {
    setDangTai(true)
    setLoi('')
    try {
      const params = new URLSearchParams()
      if (locThon) params.set('thon_id', locThon)
      if (locTrangThai) params.set('trang_thai', locTrangThai)
      if (timKiem.trim()) params.set('tim_kiem', timKiem.trim())
      const data = await api.get(`/nhan-khau?${params.toString()}`)
      setDanhSach(data || [])
    } catch (err: any) {
      setLoi(err.message || 'Khong tai duoc danh sach ho dan')
    } finally {
      setDangTai(false)
    }
  }, [locThon, locTrangThai, timKiem])

  useEffect(() => { taiDanhSach() }, [taiDanhSach])

  useEffect(() => {
    api.get('/users/thon').then(setDanhSachThon).catch(() => {})
  }, [])

  const xemChiTiet = async (id: number) => {
    setDangTaiChiTiet(true)
    setChiTiet({ id } as any)
    try {
      const data = await api.get(`/nhan-khau/${id}`)
      setChiTiet(data)
    } catch (err: any) {
      setToast(err.message || 'Khong xem duoc chi tiet')
      setChiTiet(null)
    } finally {
      setDangTaiChiTiet(false)
    }
  }

  const danhDauRoiDi = async (id: number) => {
    const lyDo = window.prompt('Ly do ho roi khoi dia phuong:')
    if (lyDo === null) return
    try {
      await api.patch(`/nhan-khau/${id}/roi-di`, { ly_do: lyDo })
      setToast('Da danh dau ho roi khoi dia phuong')
      setChiTiet(null)
      taiDanhSach()
    } catch (err: any) {
      setToast(err.message || 'Thao tac that bai')
    }
  }

  const choQuayLai = async (id: number) => {
    try {
      await api.patch(`/nhan-khau/${id}/quay-lai`, {})
      setToast('Da cho ho quay lai cu tru')
      setChiTiet(null)
      taiDanhSach()
    } catch (err: any) {
      setToast(err.message || 'Thao tac that bai')
    }
  }

  const soCuTru = danhSach.filter(h => h.trang_thai === 'dang_cu_tru').length
  const soDaRoi = danhSach.filter(h => h.trang_thai === 'da_roi').length

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <Toast hien={!!toast} noiDung={toast} dongToast={() => setToast('')} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-indigo-600" size={26} /> Quan ly nhan khau
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Danh sach ho dan cua xa. Thong tin nhay cam chi hien thi khi bam "Xem chi tiet".
          </p>
        </div>
        <button
          onClick={() => setHienThemHo(true)}
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-indigo-600 text-white font-semibold text-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:bg-indigo-500 active:translate-y-0 active:scale-[0.98] active:shadow-sm"
        >
          <Plus size={18} /> Them ho chuyen den
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        <TheThongKe nhan="Tong ho" giaTri={danhSach.length} mau="slate" icon={<Home size={18} />} />
        <TheThongKe nhan="Dang cu tru" giaTri={soCuTru} mau="emerald" icon={<ShieldCheck size={18} />} />
        <TheThongKe nhan="Da roi" giaTri={soDaRoi} mau="amber" icon={<LogOutIcon size={18} />} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={timKiem}
            onChange={e => setTimKiem(e.target.value)}
            placeholder="Tim theo ten chu ho..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
          />
        </div>
        <select
          value={locThon}
          onChange={e => setLocThon(e.target.value)}
          className="h-11 px-4 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="">Tat ca thon</option>
          {danhSachThon.map(t => <option key={t.id} value={t.id}>{t.ten_thon}</option>)}
        </select>
        <select
          value={locTrangThai}
          onChange={e => setLocTrangThai(e.target.value)}
          className="h-11 px-4 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="">Tat ca trang thai</option>
          <option value="dang_cu_tru">Dang cu tru</option>
          <option value="da_roi">Da roi</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {dangTai ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin" /> Dang tai...
          </div>
        ) : loi ? (
          <div className="flex items-center justify-center gap-2 py-16 text-red-500">
            <AlertCircle size={20} /> {loi}
          </div>
        ) : danhSach.length === 0 ? (
          <div className="py-16 text-center text-slate-400">Khong co ho dan nao</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Chu ho</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Thon</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Trang thai</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {danhSach.map(ho => (
                  <tr key={ho.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700">{ho.ho_ten_chu_ho}</td>
                    <td className="px-4 py-3 text-slate-500">{ho.ten_thon}</td>
                    <td className="px-4 py-3 text-center">
                      {ho.trang_thai === 'dang_cu_tru' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <ShieldCheck size={12} /> Dang cu tru
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                          <LogOutIcon size={12} /> Da roi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => xemChiTiet(ho.id)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300 hover:text-indigo-600 active:translate-y-0 active:scale-[0.98]"
                      >
                        <Eye size={14} /> Xem chi tiet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {chiTiet && (
        <PopupChiTiet
          chiTiet={chiTiet}
          dangTai={dangTaiChiTiet}
          dong={() => setChiTiet(null)}
          onRoiDi={danhDauRoiDi}
          onQuayLai={choQuayLai}
        />
      )}

      {hienThemHo && (
        <PopupThemHo
          danhSachThon={danhSachThon}
          dong={() => setHienThemHo(false)}
          thanhCong={() => { setHienThemHo(false); setToast('Da them ho chuyen den'); taiDanhSach() }}
        />
      )}
    </div>
  )
}

function TheThongKe({ nhan, giaTri, mau, icon }: any) {
  const mauMap: any = {
    slate: 'text-slate-600 bg-slate-100',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
  }
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center gap-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mauMap[mau]}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{giaTri}</div>
        <div className="text-xs text-slate-500">{nhan}</div>
      </div>
    </div>
  )
}

function PopupChiTiet({ chiTiet, dangTai, dong, onRoiDi, onQuayLai }: any) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') dong() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [dong])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dong} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-slate-800">Ho so ho dan</h2>
          <button onClick={dong} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {dangTai || !chiTiet.cccd ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin" /> Dang tai ho so...
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs">
              <ShieldCheck size={14} /> Luot truy cap ho so nay da duoc ghi nhat ky de bao ve du lieu ca nhan.
            </div>
            <DongThongTin icon={<Users size={16} />} nhan="Chu ho" giaTri={chiTiet.ho_ten_chu_ho} />
            <DongThongTin icon={<CreditCard size={16} />} nhan="CCCD" giaTri={chiTiet.cccd} />
            <DongThongTin icon={<Phone size={16} />} nhan="So dien thoai" giaTri={chiTiet.so_dien_thoai} />
            <DongThongTin icon={<MapPin size={16} />} nhan="Dia chi" giaTri={chiTiet.dia_chi || '—'} />
            <DongThongTin icon={<Home size={16} />} nhan="Thon" giaTri={chiTiet.ten_thon} />
            <DongThongTin
              icon={chiTiet.trang_thai === 'dang_cu_tru' ? <ShieldCheck size={16} /> : <LogOutIcon size={16} />}
              nhan="Trang thai"
              giaTri={chiTiet.trang_thai === 'dang_cu_tru' ? 'Dang cu tru' : `Da roi${chiTiet.ly_do_roi ? ' — ' + chiTiet.ly_do_roi : ''}`}
            />

            <div className="pt-2 flex gap-3">
              {chiTiet.trang_thai === 'dang_cu_tru' ? (
                <button
                  onClick={() => onRoiDi(chiTiet.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-red-50 text-red-600 font-semibold text-sm border border-red-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:bg-red-100 active:translate-y-0 active:scale-[0.98]"
                >
                  <LogOutIcon size={16} /> Danh dau roi di
                </button>
              ) : (
                <button
                  onClick={() => onQuayLai(chiTiet.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-emerald-50 text-emerald-600 font-semibold text-sm border border-emerald-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:bg-emerald-100 active:translate-y-0 active:scale-[0.98]"
                >
                  <RotateCcw size={16} /> Cho quay lai cu tru
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DongThongTin({ icon, nhan, giaTri }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{nhan}</div>
        <div className="text-sm font-semibold text-slate-700 break-words">{giaTri}</div>
      </div>
    </div>
  )
}

function PopupThemHo({ danhSachThon, dong, thanhCong }: any) {
  const [form, setForm] = useState({ ho_ten: '', cccd: '', so_dien_thoai: '', thon_id: '', dia_chi: '' })
  const [loi, setLoi] = useState<string[]>([])
  const [dangGui, setDangGui] = useState(false)

  const guiForm = async () => {
    setLoi([])
    setDangGui(true)
    try {
      await api.post('/nhan-khau', { ...form, thon_id: Number(form.thon_id) })
      thanhCong()
    } catch (err: any) {
      if (Array.isArray(err.detail)) setLoi(err.detail)
      else setLoi([err.message || 'Them ho that bai'])
    } finally {
      setDangGui(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dong} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-slate-800">Them ho chuyen den</h2>
          <button onClick={dong} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {loi.length > 0 && (
            <div className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm space-y-1">
              {loi.map((l, i) => <div key={i} className="flex items-center gap-1.5"><AlertCircle size={14} /> {l}</div>)}
            </div>
          )}
          <ONhap nhan="Ho ten chu ho" giaTri={form.ho_ten} doi={(v: string) => setForm({ ...form, ho_ten: v })} placeholder="Nguyen Van A" />
          <ONhap nhan="So CCCD (12 so)" giaTri={form.cccd} doi={(v: string) => setForm({ ...form, cccd: v })} placeholder="048025000031" />
          <ONhap nhan="So dien thoai" giaTri={form.so_dien_thoai} doi={(v: string) => setForm({ ...form, so_dien_thoai: v })} placeholder="0901234567" />
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Thon</label>
            <select
              value={form.thon_id}
              onChange={e => setForm({ ...form, thon_id: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">-- Chon thon --</option>
              {danhSachThon.map((t: any) => <option key={t.id} value={t.id}>{t.ten_thon}</option>)}
            </select>
          </div>
          <ONhap nhan="Dia chi (tuy chon)" giaTri={form.dia_chi} doi={(v: string) => setForm({ ...form, dia_chi: v })} placeholder="So nha, thon..." />

          <div className="pt-2 flex gap-3">
            <button onClick={dong} className="flex-1 h-11 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Huy
            </button>
            <button
              onClick={guiForm}
              disabled={dangGui}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-indigo-600 text-white font-semibold text-sm disabled:opacity-60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:bg-indigo-500 active:translate-y-0 active:scale-[0.98]"
            >
              {dangGui ? <><Loader2 size={16} className="animate-spin" /> Dang luu...</> : <><Plus size={16} /> Them ho</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ONhap({ nhan, giaTri, doi, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-600 mb-1.5">{nhan}</label>
      <input
        value={giaTri}
        onChange={e => doi(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
      />
    </div>
  )
}
