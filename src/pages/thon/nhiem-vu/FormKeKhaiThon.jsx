import { useState, useEffect, useMemo } from 'react'
import { X, Save, Edit3, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { danhSachCT, danhSachCTThonNhap } from './constants'

export default function FormKeKhaiThon({ hienPopup, dongPopup, nhiemVu, duLieuThonDaNhap, luuDuLieu, tongHopCT, thongKe }) {
  const [duLieu, setDuLieu] = useState({})
  const [loiValidation, setLoiValidation] = useState({})
  const [dangLuu, setDangLuu] = useState(false)
  const [loiApi, setLoiApi] = useState('')

  const danhSachCTCanNhap = useMemo(() => {
    if (!nhiemVu) return []
    return nhiemVu.chiTieu.filter(ct => danhSachCTThonNhap.includes(ct))
  }, [nhiemVu])

  const daCoDuLieu = Object.keys(duLieuThonDaNhap || {}).length > 0

  useEffect(() => {
    if (!hienPopup) return
    setLoiValidation({})
    if (daCoDuLieu) {
      setDuLieu({ ...duLieuThonDaNhap })
    } else {
      const macDinh = {}
      danhSachCTCanNhap.forEach(ct => { macDinh[ct] = '' })
      setDuLieu(macDinh)
    }
  }, [hienPopup, danhSachCTCanNhap, daCoDuLieu, duLieuThonDaNhap])

  useEffect(() => {
    if (!hienPopup) return
    const xuLyEsc = (e) => { if (e.key === 'Escape') dongPopup() }
    window.addEventListener('keydown', xuLyEsc)
    return () => window.removeEventListener('keydown', xuLyEsc)
  }, [hienPopup, dongPopup])

  if (!hienPopup || !nhiemVu) return null

  if (danhSachCTCanNhap.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dongPopup} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Kê khai chỉ tiêu thôn</h2>
            <button onClick={dongPopup} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Nhiệm vụ này không có chỉ tiêu nào cần thôn nhập.</p>
          </div>
        </div>
      </div>
    )
  }

  const soHoDaDuyet = thongKe?.daDuyet ?? 0
  const tongNhanKhau = tongHopCT?.CT02 ?? 0

  const kiemTraGiaTri = (ct, giaTri) => {
    if (giaTri === '' || giaTri === undefined) return 'Vui lòng nhập số liệu'
    const so = parseInt(giaTri)
    if (isNaN(so)) return 'Giá trị phải là số'
    if (so < 0) return 'Giá trị không được nhỏ hơn 0'
    if (ct === 'CT09' && soHoDaDuyet > 0 && so > soHoDaDuyet) {
      return `Không được vượt quá số hộ đã duyệt (${soHoDaDuyet})`
    }
    if (ct === 'CT12' && tongNhanKhau > 0 && so > tongNhanKhau) {
      return `Không được vượt quá tổng nhân khẩu (${tongNhanKhau})`
    }
    if (ct === 'CT13' && tongNhanKhau > 0 && so > tongNhanKhau) {
      return `Không được vượt quá tổng nhân khẩu (${tongNhanKhau})`
    }
    return null
  }

  const doiGiaTri = (ct, giaTri) => {
    const soNguyen = giaTri === '' ? '' : giaTri.replace(/[^0-9]/g, '')
    setDuLieu(prev => ({ ...prev, [ct]: soNguyen }))
    const loi = kiemTraGiaTri(ct, soNguyen)
    setLoiValidation(prev => ({ ...prev, [ct]: loi }))
  }

  const xuLyLuu = async () => {
    const loiMoi = {}
    let coLoi = false
    danhSachCTCanNhap.forEach(ct => {
      const loi = kiemTraGiaTri(ct, duLieu[ct])
      if (loi) { loiMoi[ct] = loi; coLoi = true }
    })
    setLoiValidation(loiMoi)
    if (coLoi) return

    const duLieuSo = {}
    danhSachCTCanNhap.forEach(ct => {
      duLieuSo[ct] = parseInt(duLieu[ct]) || 0
    })

    setDangLuu(true)
    setLoiApi('')
    try {
      await luuDuLieu(duLieuSo)
      dongPopup()
    } catch (err) {
      setLoiApi(err?.error || 'Không thể lưu kê khai thôn. Vui lòng thử lại.')
    } finally {
      setDangLuu(false)
    }
  }

  const daHopLe = danhSachCTCanNhap.every(ct => {
    const v = duLieu[ct]
    return v !== '' && v !== undefined && !kiemTraGiaTri(ct, v)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dongPopup} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {daCoDuLieu ? <Edit3 size={20} className="text-amber-500" /> : <Save size={20} className="text-blue-500" />}
              {daCoDuLieu ? 'Chỉnh sửa chỉ tiêu thôn' : 'Kê khai chỉ tiêu thôn'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{nhiemVu.ten}</p>
          </div>
          <button onClick={dongPopup} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {daCoDuLieu && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-5">
              <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">Đã có dữ liệu kê khai trước đó. Bạn có thể chỉnh sửa bên dưới.</p>
            </div>
          )}

          <div className="space-y-4">
            {danhSachCTCanNhap.map(ct => {
              const loi = loiValidation[ct]
              const goiY = {
                CT09: soHoDaDuyet > 0 ? `Không vượt quá ${soHoDaDuyet} hộ đã duyệt` : 'Số hộ đạt danh hiệu trong thôn',
                CT12: tongNhanKhau > 0 ? `Không vượt quá ${tongNhanKhau} nhân khẩu` : 'Không vượt quá tổng nhân khẩu',
                CT13: tongNhanKhau > 0 ? `Không vượt quá ${tongNhanKhau} nhân khẩu` : 'Số người được hướng dẫn',
                CT14: 'Giá trị lớn hơn hoặc bằng 0',
              }
              return (
                <div key={ct}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <span className="text-blue-600 mr-1.5">{ct}</span>
                    {danhSachCT[ct]}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={duLieu[ct] ?? ''}
                    onChange={(e) => doiGiaTri(ct, e.target.value)}
                    placeholder="Nhập số liệu..."
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-400 ${
                      loi
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
                        : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  <div className="mt-1 min-h-[20px]">
                    {loi ? (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={12} />
                        {loi}
                      </p>
                    ) : goiY[ct] ? (
                      <p className="text-xs text-slate-400">{goiY[ct]}</p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          {loiApi && (
            <p className="text-sm text-red-500 font-medium mb-3">{loiApi}</p>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={dongPopup}
              disabled={dangLuu}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={xuLyLuu}
              disabled={!daHopLe || dangLuu}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                daHopLe && !dangLuu
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {dangLuu ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {dangLuu ? 'Đang lưu...' : (daCoDuLieu ? 'Cập nhật' : 'Lưu kê khai')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
