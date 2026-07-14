import { useState, useEffect } from 'react'
import { X, CheckCircle2, XCircle, AlertTriangle, Image, ZoomIn, Loader2, MessageSquare } from 'lucide-react'
import { danhSachCT } from './constants'
import { api } from '../../../lib/api'

export default function PopupDuyetKeKhai({ hienPopup, dongPopup, hoDan, nhiemVu, xuLyDuyet }) {
  const [lyDoTuChoi, setLyDoTuChoi] = useState('')
  const [dangTuChoi, setDangTuChoi] = useState(false)
  const [danhSachMinhChung, setDanhSachMinhChung] = useState([])
  const [dangTaiMC, setDangTaiMC] = useState(false)
  const [anhPhongTo, setAnhPhongTo] = useState(null)
  const [ctDaChon, setCtDaChon] = useState<Record<string, boolean>>({})
  const [ghiChuCT, setGhiChuCT] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!hienPopup) return
    setLyDoTuChoi('')
    setDangTuChoi(false)
    setDanhSachMinhChung([])
    setAnhPhongTo(null)
    setCtDaChon({})
    setGhiChuCT({})
    const xuLyEsc = (e) => { if (e.key === 'Escape') { if (anhPhongTo) setAnhPhongTo(null); else dongPopup() } }
    window.addEventListener('keydown', xuLyEsc)
    return () => window.removeEventListener('keydown', xuLyEsc)
  }, [hienPopup, dongPopup])

  useEffect(() => {
    if (!hienPopup || !hoDan?.keKhaiId) return
    setDangTaiMC(true)
    api.get(`/evidence/ke-khai-ho/${hoDan.keKhaiId}`)
      .then(data => setDanhSachMinhChung(data || []))
      .catch(() => setDanhSachMinhChung([]))
      .finally(() => setDangTaiMC(false))
  }, [hienPopup, hoDan?.keKhaiId])

  const minhChungTheoCT = (maCT) => danhSachMinhChung.filter(mc => mc.ma_chi_tieu === maCT)

  if (!hienPopup || !hoDan || !nhiemVu) return null

  const xacNhanDuyet = async () => {
    await xuLyDuyet(hoDan.id, 'da-duyet')
    dongPopup()
  }

  const ctDanNhap = nhiemVu.chiTieu.filter(ct => !['CT01','CT09','CT12','CT13','CT14'].includes(ct))

  const xacNhanTuChoi = async () => {
    if (!lyDoTuChoi.trim()) return
    const dsCTChon = Object.entries(ctDaChon)
      .filter(([, v]) => v)
      .map(([ma]) => ({ ma, ghiChu: ghiChuCT[ma]?.trim() || '' }))
    const dsGui = dsCTChon.length > 0 ? dsCTChon : ctDanNhap.map(ma => ({ ma, ghiChu: '' }))
    await xuLyDuyet(hoDan.id, 'tu-choi', lyDoTuChoi.trim(), dsGui)
    dongPopup()
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
              const dsMC = minhChungTheoCT(ct)
              return (
                <div key={ct} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-blue-600 mr-1.5">{ct}</span>
                      <span className="text-xs text-slate-500">{danhSachCT[ct]}</span>
                    </div>
                    <span className="text-base font-bold text-slate-800 ml-3">
                      {(hoDan.duLieuCT?.[ct] ?? 0).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {dsMC.length > 0 && (
                    <div className="px-4 pb-3 pt-0">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Image size={12} />
                        Minh chứng ({dsMC.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dsMC.map(mc => (
                          <button
                            key={mc.id}
                            onClick={() => setAnhPhongTo(mc.file_url)}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group/img"
                          >
                            <img
                              src={mc.file_url}
                              alt={mc.file_name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                              <ZoomIn size={16} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {dangTaiMC && (
            <div className="flex items-center justify-center py-3">
              <Loader2 size={18} className="animate-spin text-blue-500 mr-2" />
              <span className="text-xs text-slate-500">Đang tải minh chứng...</span>
            </div>
          )}

          {!dangTaiMC && danhSachMinhChung.length === 0 && hoDan.keKhaiId && (
            <div className="mt-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <Image size={20} className="mx-auto text-slate-300 mb-1" />
              <p className="text-xs text-slate-400">Hộ dân chưa gửi minh chứng</p>
            </div>
          )}

          {hoDan.trangThaiDuyet === 'tu-choi' && hoDan.lyDoTuChoi && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-semibold text-red-700 mb-1">Lý do từ chối:</p>
              <p className="text-sm text-red-600">{hoDan.lyDoTuChoi}</p>
            </div>
          )}

          {dangTuChoi && (
            <div className="mt-4 space-y-4">
              <div>
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Chỉ tiêu cần kê khai lại
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const tatCaDaChon = ctDanNhap.every(ct => ctDaChon[ct])
                      const moi = {}
                      ctDanNhap.forEach(ct => { moi[ct] = !tatCaDaChon })
                      setCtDaChon(moi)
                    }}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-md transition-colors"
                  >
                    {ctDanNhap.every(ct => ctDaChon[ct]) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ctDanNhap.map(ct => (
                    <div key={ct} className={`rounded-lg border p-3 transition-colors ${ctDaChon[ct] ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!ctDaChon[ct]}
                          onChange={(e) => setCtDaChon(prev => ({ ...prev, [ct]: e.target.checked }))}
                          className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                        />
                        <span className="text-xs font-bold text-blue-600">{ct}</span>
                        <span className="text-xs text-slate-600 flex-1">{danhSachCT[ct]}</span>
                      </label>
                      {ctDaChon[ct] && (
                        <div className="mt-2 ml-6">
                          <input
                            type="text"
                            value={ghiChuCT[ct] || ''}
                            onChange={(e) => setGhiChuCT(prev => ({ ...prev, [ct]: e.target.value }))}
                            placeholder="Ghi chú cho CT này (không bắt buộc)..."
                            className="w-full px-3 py-1.5 text-xs border border-orange-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-slate-400"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {hoDan.trangThaiDuyet !== 'da-duyet' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            {!dangTuChoi ? (
              <>
                <button
                  onClick={() => setDangTuChoi(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                >
                  <XCircle size={16} />
                  Từ chối
                </button>
                <button
                  onClick={xacNhanDuyet}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg text-sm shadow-md shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98]"
                >
                  <CheckCircle2 size={16} />
                  Duyệt
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setDangTuChoi(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={xacNhanTuChoi}
                  disabled={!lyDoTuChoi.trim()}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    lyDoTuChoi.trim()
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/25 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <XCircle size={16} />
                  Xác nhận từ chối
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {anhPhongTo && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setAnhPhongTo(null)}
        >
          <button
            onClick={() => setAnhPhongTo(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={anhPhongTo}
            alt="Minh chứng phóng to"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
