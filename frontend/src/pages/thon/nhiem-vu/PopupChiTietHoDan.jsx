import { useEffect } from 'react'
import { X, CheckCircle2, Clock } from 'lucide-react'
import { danhSachCT } from './constants'

export default function PopupChiTietHoDan({ hienPopup, dongPopup, nhiemVu, danhSachHo, tongHopCT }) {
  useEffect(() => {
    if (!hienPopup) return
    const xuLyEsc = (e) => { if (e.key === 'Escape') dongPopup() }
    window.addEventListener('keydown', xuLyEsc)
    return () => window.removeEventListener('keydown', xuLyEsc)
  }, [hienPopup, dongPopup])

  if (!hienPopup || !nhiemVu) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dongPopup} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Chi tiết kê khai theo hộ dân</h2>
            <p className="text-xs text-slate-500 mt-0.5">{nhiemVu.ten}</p>
          </div>
          <button onClick={dongPopup} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 sticky left-0 bg-slate-50 z-20 min-w-[180px]">
                  Chỉ tiêu
                </th>
                <th className="text-center px-4 py-3 font-bold text-xs uppercase tracking-wider text-blue-700 border-b border-slate-200 bg-blue-50/50 min-w-[100px]">
                  Tổng
                </th>
                {danhSachHo.map((ho, i) => (
                  <th key={i} className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 min-w-[100px]">
                    <span className={ho.daNop ? 'text-slate-600' : 'text-slate-400'}>
                      {ho.ten.replace('Hộ ', '')}
                    </span>
                    {ho.daNop ? (
                      <CheckCircle2 size={12} className="inline-block ml-1 text-emerald-500 -mt-0.5" />
                    ) : (
                      <Clock size={12} className="inline-block ml-1 text-slate-300 -mt-0.5" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nhiemVu.chiTieu.map((ct, idx) => (
                <tr key={ct} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/40 transition-colors`}>
                  <td className={`px-4 py-3 border-b border-slate-100 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <span className="font-bold text-blue-600 mr-2">{ct}</span>
                    <span className="text-slate-600 text-xs">{danhSachCT[ct]}</span>
                  </td>
                  <td className="text-center px-4 py-3 border-b border-slate-100 bg-blue-50/30">
                    <span className="font-bold text-blue-700">
                      {(tongHopCT[ct] ?? 0).toLocaleString('vi-VN')}
                    </span>
                  </td>
                  {danhSachHo.map((ho, i) => (
                    <td key={i} className="text-center px-3 py-3 border-b border-slate-100">
                      {ho.daNop ? (
                        <span className="font-semibold text-slate-700">
                          {(ho.duLieuCT?.[ct] ?? 0).toLocaleString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
