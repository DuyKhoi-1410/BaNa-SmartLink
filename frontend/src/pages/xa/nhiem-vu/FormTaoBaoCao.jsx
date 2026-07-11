import { useState, useRef, useEffect } from 'react'
import { Plus, X, Paperclip, FileText, Trash2 } from 'lucide-react'
import { danhSachCT, formMacDinh } from './constants'

export default function FormTaoBaoCao({ hienPopup, dongPopup, themBaoCao }) {
  const [form, setForm] = useState(formMacDinh)
  const [loiForm, setLoiForm] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (hienPopup) {
      setForm(formMacDinh)
      setLoiForm({})
      setLoiChung('')
      setDangTao(false)
    }
  }, [hienPopup])

  useEffect(() => {
    if (!hienPopup) return
    const xuLyPhimEsc = (e) => { if (e.key === 'Escape') dongPopup() }
    window.addEventListener('keydown', xuLyPhimEsc)
    return () => window.removeEventListener('keydown', xuLyPhimEsc)
  }, [hienPopup, dongPopup])

  const chonChiTieu = (ct) => {
    setForm(prev => ({
      ...prev,
      chiTieu: prev.chiTieu.includes(ct)
        ? prev.chiTieu.filter(c => c !== ct)
        : [...prev.chiTieu, ct]
    }))
  }

  const chonTatCaChiTieu = () => {
    const tatCa = Object.keys(danhSachCT)
    const daChonHet = tatCa.every(ct => form.chiTieu.includes(ct))
    setForm(prev => ({ ...prev, chiTieu: daChonHet ? [] : tatCa }))
  }

  const themDinhKem = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    const fileMoi = files.map(f => ({ file: f, moTa: '' }))
    setForm(prev => ({ ...prev, dinhKem: [...prev.dinhKem, ...fileMoi] }))
    e.target.value = ''
  }

  const capNhatMoTaFile = (index, moTa) => {
    setForm(prev => ({
      ...prev,
      dinhKem: prev.dinhKem.map((item, i) => i === index ? { ...item, moTa } : item)
    }))
  }

  const xoaDinhKem = (index) => {
    setForm(prev => ({ ...prev, dinhKem: prev.dinhKem.filter((_, i) => i !== index) }))
  }

  const [loiChung, setLoiChung] = useState('')
  const [dangTao, setDangTao] = useState(false)

  const taoBaoCao = async () => {
    const loi = {}
    if (!form.ten.trim()) loi.ten = 'Vui lòng nhập tên báo cáo'
    if (form.chiTieu.length === 0) loi.chiTieu = 'Vui lòng chọn ít nhất 1 chỉ tiêu'
    if (!form.ngayBatDau) loi.ngayBatDau = 'Vui lòng chọn ngày bắt đầu'
    if (!form.ngayHetHan) loi.ngayHetHan = 'Vui lòng chọn ngày hết hạn'
    if (form.ngayBatDau && form.ngayHetHan && form.ngayBatDau > form.ngayHetHan) {
      loi.ngayHetHan = 'Ngày hết hạn phải sau ngày bắt đầu'
    }

    if (Object.keys(loi).length > 0) {
      setLoiForm(loi)
      return
    }
    setLoiForm({})
    setLoiChung('')
    setDangTao(true)

    try {
      const baoCaoMoi = {
        ten: form.ten.trim(),
        chiTieu: form.chiTieu,
        ngayBatDau: form.ngayBatDau,
        ngayHetHan: form.ngayHetHan,
        chiTiet: form.chiTiet.trim(),
        dinhKem: form.dinhKem,
      }
      await themBaoCao(baoCaoMoi)
      dongPopup()
    } catch (err) {
      if (err.status === 403) {
        setLoiChung('Bạn không có quyền tạo báo cáo. Vui lòng đăng nhập lại bằng tài khoản cán bộ xã.')
      } else {
        setLoiChung(err.error || 'Không thể tạo báo cáo. Vui lòng thử lại.')
      }
    } finally {
      setDangTao(false)
    }
  }

  if (!hienPopup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dongPopup} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Tạo Báo Cáo Thủ Công</h2>
          <button onClick={dongPopup} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên báo cáo <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.ten}
              onChange={(e) => { setForm(prev => ({ ...prev, ten: e.target.value })); setLoiForm(prev => ({ ...prev, ten: undefined })) }}
              placeholder="VD: Kê khai Quý 3/2026"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${loiForm.ten ? 'border-red-400 focus:ring-red-500/40 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500/40 focus:border-blue-500'}`}
            />
            {loiForm.ten && <p className="text-xs text-red-500 mt-1.5 font-medium">{loiForm.ten}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Chọn chỉ tiêu <span className="text-red-500">*</span></label>
              <button type="button" onClick={chonTatCaChiTieu} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                {Object.keys(danhSachCT).every(ct => form.chiTieu.includes(ct)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 rounded-lg ${loiForm.chiTieu ? 'ring-1 ring-red-400' : ''}`}>
              {Object.entries(danhSachCT).map(([ma, ten]) => (
                <label
                  key={ma}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${form.chiTieu.includes(ma) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <input
                    type="checkbox"
                    checked={form.chiTieu.includes(ma)}
                    onChange={() => { chonChiTieu(ma); setLoiForm(prev => ({ ...prev, chiTieu: undefined })) }}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">{ma}</span>
                  <span className="text-slate-500 truncate text-xs">{ten}</span>
                </label>
              ))}
            </div>
            {loiForm.chiTieu && <p className="text-xs text-red-500 mt-1.5 font-medium">{loiForm.chiTieu}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chi tiết / Mô tả</label>
            <textarea
              value={form.chiTiet}
              onChange={(e) => setForm(prev => ({ ...prev, chiTiet: e.target.value }))}
              placeholder="Nội dung yêu cầu cụ thể cho đợt báo cáo này..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Đính kèm văn bản</label>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={themDinhKem} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all w-full justify-center"
            >
              <Paperclip size={16} />
              Chọn file đính kèm (PDF, Word, Excel, Ảnh)
            </button>
            {form.dinhKem.length > 0 && (
              <div className="mt-3 space-y-3">
                {form.dinhKem.map((item, index) => (
                  <div key={index} className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={15} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate flex-1">{item.file.name}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{(item.file.size / 1024).toFixed(0)} KB</span>
                      <button type="button" onClick={() => xoaDinhKem(index)} className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.moTa}
                      onChange={(e) => capNhatMoTaFile(index, e.target.value)}
                      placeholder="Mô tả văn bản (VD: Công văn yêu cầu rà soát)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.ngayBatDau}
                onChange={(e) => { setForm(prev => ({ ...prev, ngayBatDau: e.target.value })); setLoiForm(prev => ({ ...prev, ngayBatDau: undefined })) }}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${loiForm.ngayBatDau ? 'border-red-400 focus:ring-red-500/40 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500/40 focus:border-blue-500'}`}
              />
              {loiForm.ngayBatDau && <p className="text-xs text-red-500 mt-1.5 font-medium">{loiForm.ngayBatDau}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày hết hạn <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.ngayHetHan}
                onChange={(e) => { setForm(prev => ({ ...prev, ngayHetHan: e.target.value })); setLoiForm(prev => ({ ...prev, ngayHetHan: undefined })) }}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${loiForm.ngayHetHan ? 'border-red-400 focus:ring-red-500/40 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500/40 focus:border-blue-500'}`}
              />
              {loiForm.ngayHetHan && <p className="text-xs text-red-500 mt-1.5 font-medium">{loiForm.ngayHetHan}</p>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 space-y-3">
          {loiChung && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              {loiChung}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button onClick={dongPopup} disabled={dangTao} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
              Hủy
            </button>
            <button
              onClick={taoBaoCao}
              disabled={dangTao}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/25 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {dangTao ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo...</>
              ) : (
                <><Plus size={16} /> Tạo Báo Cáo</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
