import { useState, useEffect } from 'react'
import { X, CheckCircle2, XCircle, AlertTriangle, Loader2, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { danhSachCT } from './constants'
import { api } from '../../../lib/api'

const BACKEND_ROOT = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/api\/v1$/, '')

export default function PopupDuyetKeKhai({ hienPopup, dongPopup, hoDan, nhiemVu, xuLyDuyet }) {
  const [lyDoTuChoi, setLyDoTuChoi] = useState('')
  const [dangTuChoi, setDangTuChoi] = useState(false)
  const [dangXuLy, setDangXuLy] = useState(false)
  const [loiApi, setLoiApi] = useState('')
  const [minhChung, setMinhChung] = useState({})
  const [dangTaiMC, setDangTaiMC] = useState(false)
  const [ctMoRong, setCtMoRong] = useState({})
  const [anhPhongTo, setAnhPhongTo] = useState(null)

  useEffect(() => {
    if (!hienPopup) return
    setLyDoTuChoi('')
    setDangTuChoi(false)
    setDangXuLy(false)
    setLoiApi('')
    setCtMoRong({})
    setAnhPhongTo(null)
    const xuLyEsc = (e) => { if (e.key === 'Escape') { if (anhPhongTo) setAnhPhongTo(null); else dongPopup() } }
    window.addEventListener('keydown', xuLyEsc)
    return () => window.removeEventListener('keydown', xuLyEsc)
  }, [hienPopup, dongPopup])

  useEffect(() => {
    if (!hienPopup || !hoDan?.id) { setMinhChung({}); return }
    let huy = false
    const taiMinhChung = async () => {
      setDangTaiMC(true)
      try {
        const ds = await api.get(`/evidence/ke-khai-ho/${hoDan.id}`)
        if (huy) return
        const nhom = {}
        if (Array.isArray(ds)) {
          ds.forEach(mc => {
            const ma = mc.ma_chi_tieu
            if (!nhom[ma]) nhom[ma] = []
            nhom[ma].push(mc)
          })
        }
        setMinhChung(nhom)
      } catch {
        if (!huy) setMinhChung({})
      } finally {
        if (!huy) setDangTaiMC(false)
      }
    }
    taiMinhChung()
    return () => { huy = true }
  }, [hienPopup, hoDan?.id])

  if (!hienPopup || !hoDan || !nhiemVu) return null

  const xacNhanDuyet = async () => {
    setDangXuLy(true)
    setLoiApi('')
    try {
      await xuLyDuyet(hoDan.id, 'da-duyet')
      dongPopup()
    } catch (err) {
      setLoiApi(err?.error || 'Không thể duyệt. Vui lòng thử lại.')
    } finally {
      setDangXuLy(false)
    }
  }

  const xacNhanTuChoi = async () => {
    if (!lyDoTuChoi.trim()) return
    setDangXuLy(true)
    setLoiApi('')
    try {
      await xuLyDuyet(hoDan.id, 'tu-choi', lyDoTuChoi.trim())
      dongPopup()
    } catch (err) {
      setLoiApi(err?.error || 'Không thể trả lại. Vui lòng thử lại.')
    } finally {
      setDangXuLy(false)
    }
  }

  const mauTrangThai = {
    'cho-duyet': { nhan: 'Chờ duyệt', mau: 'bg-amber-100 text-amber-700', icon: <AlertTriangle size={14} /> },
    'da-duyet': { nhan: 'Đã duyệt', mau: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={14} /> },
    'tu-choi': { nhan: 'Từ chối', mau: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
  }
  const tt = mauTrangThai[hoDan.trangThaiDuyet || 'cho-duyet']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dongPopup} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Duyệt kê khai</h2>
            <p className="text-xs text-slate-500 mt-0.5">{hoDan.ten}</p>
          </div>
          <button onClick={dongPopup} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">Trạng thái:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tt.mau}`}>
              {tt.icon}
              {tt.nhan}
            </span>
          </div>

          <div className="space-y-2">
            {nhiemVu.chiTieu.map(ct => {
              const dsMC = minhChung[ct] || []
              const coMC = dsMC.length > 0
              const dangMo = ctMoRong[ct]

              return (
                <div key={ct} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-blue-600 mr-1.5">{ct}</span>
                      <span className="text-xs text-slate-500">{danhSachCT[ct]}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-base font-bold text-slate-800">
                        {(hoDan.duLieuCT?.[ct] ?? 0).toLocaleString('vi-VN')}
                      </span>
                      {coMC && (
                        <button
                          type="button"
                          onClick={() => setCtMoRong(prev => ({ ...prev, [ct]: !prev[ct] }))}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <ImageIcon size={12} />
                          {dsMC.length}
                          {dangMo ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                  {coMC && dangMo && (
                    <div className="px-4 pb-3 pt-1 border-t border-slate-100">
                      <div className="flex flex-wrap gap-2">
                        {dsMC.map(mc => {
                          const laAnh = mc.loai_file?.startsWith('image/')
                          const urlAnh = mc.file_url?.startsWith('/') ? `${BACKEND_ROOT}${mc.file_url}` : mc.file_url
                          return laAnh ? (
                            <button
                              key={mc.id}
                              type="button"
                              onClick={() => setAnhPhongTo(urlAnh)}
                              className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex-shrink-0"
                            >
                              <img src={urlAnh} alt={mc.file_name} className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <a
                              key={mc.id}
                              href={urlAnh}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <ImageIcon size={14} />
                              <span className="truncate max-w-[120px]">{mc.file_name}</span>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {dangTaiMC && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Đang tải minh chứng...
              </div>
            )}
          </div>

          {hoDan.trangThaiDuyet === 'tu-choi' && hoDan.lyDoTuChoi && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-semibold text-red-700 mb-1">Lý do từ chối:</p>
              <p className="text-sm text-red-600">{hoDan.lyDoTuChoi}</p>
            </div>
          )}

          {dangTuChoi && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lyDoTuChoi}
                onChange={(e) => setLyDoTuChoi(e.target.value)}
                placeholder="Nhập lý do từ chối kê khai..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors placeholder:text-slate-400 resize-none"
              />
            </div>
          )}
        </div>

        {hoDan.trangThaiDuyet !== 'da-duyet' && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            {loiApi && (
              <p className="text-sm text-red-500 font-medium mb-3">{loiApi}</p>
            )}
            <div className="flex items-center justify-end gap-3">
              {!dangTuChoi ? (
                <>
                  <button
                    onClick={() => setDangTuChoi(true)}
                    disabled={dangXuLy}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Từ chối
                  </button>
                  <button
                    onClick={xacNhanDuyet}
                    disabled={dangXuLy}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg text-sm shadow-md shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
                  >
                    {dangXuLy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {dangXuLy ? 'Đang duyệt...' : 'Duyệt'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDangTuChoi(false)}
                    disabled={dangXuLy}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={xacNhanTuChoi}
                    disabled={!lyDoTuChoi.trim() || dangXuLy}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      lyDoTuChoi.trim() && !dangXuLy
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/25 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {dangXuLy ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    {dangXuLy ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {anhPhongTo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setAnhPhongTo(null)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setAnhPhongTo(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors z-10"
            >
              <X size={16} />
            </button>
            <img src={anhPhongTo} alt="Minh chứng" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
