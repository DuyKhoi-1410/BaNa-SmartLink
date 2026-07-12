import { useState, useMemo, useEffect, useRef } from 'react'
import { CalendarDays, Clock, Users, ArrowLeft, CheckCircle2, FileText, Download, Database, BarChart3, Building2, Trash2, Loader2, Paperclip, Upload } from 'lucide-react'
import { danhSachCT } from './constants'
import { tinhTrangThai, dinhDangNgay } from './utils'
import { api } from '../../../lib/api'
import PopupChiTietKeKhai from './PopupChiTietKeKhai'

export default function ChiTietBaoCao({ baoCao, danhSachThon, quayLai }) {
  const [hienPopupChiTiet, setHienPopupChiTiet] = useState(false)
  const [danhSachDinhKem, setDanhSachDinhKem] = useState([])
  const [dangTaiDinhKem, setDangTaiDinhKem] = useState(true)
  const [dangXoaId, setDangXoaId] = useState(null)
  const [dangUpload, setDangUpload] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!baoCao?.id) return
    setDangTaiDinhKem(true)
    api.get(`/attachments/${baoCao.id}`)
      .then(data => setDanhSachDinhKem(data))
      .catch(() => setDanhSachDinhKem([]))
      .finally(() => setDangTaiDinhKem(false))
  }, [baoCao?.id])

  const xoaDinhKem = async (fileId) => {
    if (!confirm('Bạn có chắc muốn xóa file này?')) return
    setDangXoaId(fileId)
    try {
      await api.delete(`/attachments/file/${fileId}`)
      setDanhSachDinhKem(prev => prev.filter(f => f.id !== fileId))
    } catch (err) {
      alert('Không thể xóa file: ' + (err.error || err.message || 'Lỗi'))
    } finally {
      setDangXoaId(null)
    }
  }

  const themDinhKem = async (e: any) => {
    const files = Array.from(e.target.files) as any[]
    if (files.length === 0) return
    setDangUpload(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        const record = await api.upload(`/attachments/${baoCao.id}`, formData)
        setDanhSachDinhKem(prev => [...prev, record])
      }
    } catch (err) {
      alert('Upload thất bại: ' + (err.error || err.message || 'Lỗi'))
    } finally {
      setDangUpload(false)
      e.target.value = ''
    }
  }

  const trangThai = tinhTrangThai(baoCao.ngayHetHan)
  const phanTram = Math.round((baoCao.soThonDaNop / baoCao.tongSoThon) * 100)

  const tongHopCT = useMemo(() => {
    const thonDaNop = danhSachThon.filter(t => t.daNop)
    const tong = {}
    baoCao.chiTieu.forEach(ct => {
      tong[ct] = thonDaNop.reduce((s, thon) => s + (thon.duLieuCT?.[ct] ?? 0), 0)
    })
    return tong
  }, [baoCao, danhSachThon])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <button
        onClick={quayLai}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm mb-6 group transition-colors"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách
      </button>

      {/* Thông tin báo cáo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{baoCao.ten}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${baoCao.loai === 'dinh-ky' ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                {baoCao.loai === 'dinh-ky' ? 'Định kỳ' : 'Đột xuất'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${trangThai.mau}`}>
                {trangThai.nhan}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs md:text-sm text-slate-500">
            <div className="flex items-center gap-1.5 sm:justify-end">
              <CalendarDays size={14} className="text-slate-400" />
              <span>Bắt đầu: {dinhDangNgay(baoCao.ngayBatDau)}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:justify-end mt-1">
              <Clock size={14} className="text-slate-400" />
              <span>Hết hạn: {dinhDangNgay(baoCao.ngayHetHan)}</span>
            </div>
          </div>
        </div>

        {/* Tiến độ */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <Users size={15} className="text-slate-400" />
              Tiến độ: {baoCao.soThonDaNop}/{baoCao.tongSoThon} thôn đã nộp
            </span>
            <span className="text-sm font-bold text-blue-600">{phanTram}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${phanTram === 100 ? 'from-emerald-400 to-emerald-600' : 'from-blue-400 to-indigo-500'} transition-all duration-700`}
              style={{ width: `${phanTram}%` }}
            />
          </div>
        </div>

        {/* Chỉ tiêu áp dụng */}
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-600 mb-2">Chỉ tiêu áp dụng:</p>
          <div className="flex flex-wrap gap-2">
            {baoCao.chiTieu.map(ct => (
              <span key={ct} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                {ct}
              </span>
            ))}
          </div>
        </div>

        {/* Chi tiết */}
        {baoCao.chiTiet && (
          <div className="mt-5">
            <p className="text-sm font-medium text-slate-600 mb-1.5">Chi tiết:</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
              {baoCao.chiTiet}
            </p>
          </div>
        )}

        {/* Đính kèm */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <Paperclip size={15} className="text-slate-400" />
              Văn bản đính kèm ({danhSachDinhKem.length})
            </p>
            <div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={themDinhKem} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={dangUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {dangUpload ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Thêm file
              </button>
            </div>
          </div>
          {dangTaiDinhKem ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={20} className="animate-spin text-blue-500" />
            </div>
          ) : danhSachDinhKem.length > 0 ? (
            <div className="space-y-2">
              {danhSachDinhKem.map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText size={18} className="text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.file_name}</p>
                    {file.mo_ta && <p className="text-xs text-slate-500 mt-0.5">{file.mo_ta}</p>}
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{(file.file_size / 1024).toFixed(0)} KB</span>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0 text-xs font-medium"
                  >
                    <Download size={14} />
                    Tải
                  </a>
                  <button
                    onClick={() => xoaDinhKem(file.id)}
                    disabled={dangXoaId === file.id}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    {dangXoaId === file.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Chưa có file đính kèm nào</p>
          )}
        </div>
      </div>

      {/* Tổng hợp chỉ tiêu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            Tổng hợp chỉ tiêu
            <span className="text-xs font-normal text-slate-400 ml-1">
              (từ {danhSachThon.filter(t => t.daNop).length}/{danhSachThon.length} thôn đã nộp)
            </span>
          </h2>
          <button
            onClick={() => setHienPopupChiTiet(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-500/25 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm"
          >
            <Database size={16} />
            Chi tiết kê khai
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {baoCao.chiTieu.map(ct => (
            <div key={ct} className="flex flex-col px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-semibold text-blue-600 mb-0.5">{ct}</span>
              <span className="text-xs text-slate-500 mb-2 line-clamp-1">{danhSachCT[ct]}</span>
              <span className="text-xl font-bold text-slate-800">{(tongHopCT[ct] ?? 0).toLocaleString('vi-VN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tiến độ các thôn — Kanban */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={20} className="text-blue-500" />
            Tiến độ các thôn
          </h2>
          <span className="text-sm font-bold text-blue-600">
            {danhSachThon.filter(t => t.daNop).length}/{danhSachThon.length} thôn đã nộp
          </span>
        </div>

        <div className="mb-6">
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${
                danhSachThon.length > 0 && danhSachThon.every(t => t.daNop)
                  ? 'from-emerald-400 to-emerald-600'
                  : 'from-blue-400 to-indigo-500'
              }`}
              style={{ width: danhSachThon.length > 0 ? `${Math.round((danhSachThon.filter(t => t.daNop).length / danhSachThon.length) * 100)}%` : '0%' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Cột Đã nộp */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-emerald-700">Đã nộp</span>
              <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                {danhSachThon.filter(t => t.daNop).length}
              </span>
            </div>
            <div className="space-y-2">
              {danhSachThon.filter(t => t.daNop).length > 0 ? (
                danhSachThon.filter(t => t.daNop).map((thon, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-200">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{thon.ten}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Nộp ngày {dinhDangNgay(thon.ngayNop)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">Chưa có thôn nào nộp</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột Chưa nộp */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-sm font-bold text-red-600">Chưa nộp</span>
              <span className="ml-auto text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                {danhSachThon.filter(t => !t.daNop).length}
              </span>
            </div>
            <div className="space-y-2">
              {danhSachThon.filter(t => !t.daNop).length > 0 ? (
                danhSachThon.filter(t => !t.daNop).map((thon, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50/50 border border-red-200 hover:border-red-300 hover:shadow-sm transition-all duration-200">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{thon.ten}</p>
                      <p className="text-xs text-red-500 mt-0.5">Đang chờ nộp</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                  <CheckCircle2 size={20} className="mx-auto text-emerald-400 mb-1" />
                  <p className="text-sm text-emerald-600 font-medium">Tất cả đã nộp!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PopupChiTietKeKhai
        hienPopup={hienPopupChiTiet}
        dongPopup={() => setHienPopupChiTiet(false)}
        baoCao={baoCao}
        danhSachThon={danhSachThon}
        tongHopCT={tongHopCT}
      />
    </div>
  )
}
