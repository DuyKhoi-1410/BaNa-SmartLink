import { useState, useMemo, useCallback, useEffect } from 'react'
import { CalendarDays, Clock, Users, ArrowLeft, CheckCircle2, FileText, Download, Database, BarChart3, Home, Edit3, XCircle, AlertTriangle, Eye, Send, Loader2 } from 'lucide-react'
import { danhSachCT, danhSachCTThonNhap } from './constants'
import { tinhTrangThai, dinhDangNgay, tinhThongKeHo } from './utils'
import PopupChiTietHoDan from './PopupChiTietHoDan'
import FormKeKhaiThon from './FormKeKhaiThon'
import PopupDuyetKeKhai from './PopupDuyetKeKhai'
import { api } from '../../../lib/api'

export default function ChiTietNhiemVuThon({ nhiemVu, danhSachHo, capNhatDanhSachHo, quayLai, taiLaiHo, thonId, dangTaiHo }) {
  const [hienPopupChiTiet, setHienPopupChiTiet] = useState(false)
  const [hienFormKeKhai, setHienFormKeKhai] = useState(false)
  const [hienPopupDuyet, setHienPopupDuyet] = useState(false)
  const [hoCanDuyet, setHoCanDuyet] = useState(null)
  const [duLieuThon, setDuLieuThon] = useState({})
  const [dangNopXa, setDangNopXa] = useState(false)
  const [loiNopXa, setLoiNopXa] = useState('')

  const trangThai = tinhTrangThai(nhiemVu.ngayHetHan)
  const thongKe = useMemo(() => tinhThongKeHo(danhSachHo, nhiemVu.tongSoHo), [danhSachHo, nhiemVu.tongSoHo])

  const coCTThonNhap = useMemo(() => {
    return nhiemVu.chiTieu.some(ct => danhSachCTThonNhap.includes(ct))
  }, [nhiemVu])

  const tongHopCT = useMemo(() => {
    const hoDaNop = danhSachHo.filter(h => h.daNop && h.trangThaiDuyet === 'da-duyet')
    const tong = {}
    nhiemVu.chiTieu.forEach(ct => {
      tong[ct] = hoDaNop.reduce((s, ho) => s + (ho.duLieuCT?.[ct] ?? 0), 0)
    })
    return tong
  }, [nhiemVu, danhSachHo])

  useEffect(() => {
    if (!thonId || !nhiemVu?.id) return
    api.get(`/village-declarations/${nhiemVu.id}/${thonId}`)
      .then(data => {
        if (data) {
          const dl = {}
          if (data.ct09_gia_dinh_van_hoa != null) dl.CT09 = data.ct09_gia_dinh_van_hoa
          if (data.ct12_thanh_vien_to_cnsc != null) dl.CT12 = data.ct12_thanh_vien_to_cnsc
          if (data.ct13_huong_dan_dvc != null) dl.CT13 = data.ct13_huong_dan_dvc
          if (data.ct14_bao_luc_gia_dinh != null) dl.CT14 = data.ct14_bao_luc_gia_dinh
          if (Object.keys(dl).length > 0) setDuLieuThon(dl)
        }
      })
      .catch(() => {})
  }, [thonId, nhiemVu?.id])

  const luuDuLieuThon = useCallback(async (duLieuMoi) => {
    const body = {
      dot_id: nhiemVu.id,
      thon_id: thonId,
    }
    if (duLieuMoi.CT09 !== undefined) body.ct09_gia_dinh_van_hoa = duLieuMoi.CT09
    if (duLieuMoi.CT12 !== undefined) body.ct12_thanh_vien_to_cnsc = duLieuMoi.CT12
    if (duLieuMoi.CT13 !== undefined) body.ct13_huong_dan_dvc = duLieuMoi.CT13
    if (duLieuMoi.CT14 !== undefined) body.ct14_bao_luc_gia_dinh = duLieuMoi.CT14
    await api.post('/village-declarations', body)
    setDuLieuThon(duLieuMoi)
  }, [nhiemVu?.id, thonId])

  const nopXa = useCallback(async () => {
    if (!thonId || !nhiemVu?.id) return
    setDangNopXa(true)
    setLoiNopXa('')
    try {
      await api.patch(`/village-declarations/${nhiemVu.id}/${thonId}/nop-xa`)
    } catch (err) {
      setLoiNopXa(err?.error || 'Không thể nộp xã. Vui lòng thử lại.')
    } finally {
      setDangNopXa(false)
    }
  }, [thonId, nhiemVu?.id])

  const moPopupDuyet = useCallback((ho) => {
    setHoCanDuyet(ho)
    setHienPopupDuyet(true)
  }, [])

  const xuLyDuyet = useCallback(async (hoId, trangThaiMoi, lyDo) => {
    try {
      if (trangThaiMoi === 'da-duyet') {
        await api.patch(`/declarations/${hoId}/duyet`)
      } else if (trangThaiMoi === 'tu-choi') {
        await api.patch(`/declarations/${hoId}/tra-lai`, { ly_do: lyDo })
      }
      if (taiLaiHo) await taiLaiHo()
    } catch (err) {
      console.error('Loi duyet ke khai:', err)
    }
  }, [taiLaiHo])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={quayLai}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm group transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </button>
        <div className="flex items-center gap-3">
          {coCTThonNhap && (
            <button
              onClick={() => setHienFormKeKhai(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-600/30 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-600/40 hover:bg-indigo-500 active:translate-y-0 active:scale-[0.98] active:shadow-sm"
            >
              <Edit3 size={16} />
              {Object.keys(duLieuThon).length > 0 ? 'Sửa kê khai thôn' : 'Kê khai CT thôn'}
            </button>
          )}
          <button
            onClick={nopXa}
            disabled={dangNopXa}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-600/30 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-600/40 hover:bg-indigo-500 active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dangNopXa ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {dangNopXa ? 'Đang nộp...' : 'Nộp xã'}
          </button>
        </div>
      </div>

      {loiNopXa && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
          {loiNopXa}
        </div>
      )}

      {/* Thông tin nhiệm vụ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{nhiemVu.ten}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${nhiemVu.loai === 'dinh-ky' ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                {nhiemVu.loai === 'dinh-ky' ? 'Định kỳ' : 'Đột xuất'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${trangThai.mau}`}>
                {trangThai.nhan}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs md:text-sm text-slate-500">
            <div className="flex items-center gap-1.5 sm:justify-end">
              <CalendarDays size={14} className="text-slate-400" />
              <span>Bắt đầu: {dinhDangNgay(nhiemVu.ngayBatDau)}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:justify-end mt-1">
              <Clock size={14} className="text-slate-400" />
              <span>Hết hạn: {dinhDangNgay(nhiemVu.ngayHetHan)}</span>
            </div>
          </div>
        </div>

        {/* Tiến độ — thanh phân đoạn 3 màu */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Users size={15} className="text-blue-500" />
              {thongKe.daNop}/{thongKe.tongHo} hộ đã nộp
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-emerald-700 font-semibold">{thongKe.daDuyet} đã duyệt</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-amber-700 font-semibold">{thongKe.choDuyet} chờ duyệt</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="text-slate-500 font-semibold">{thongKe.chuaNop} chưa nộp</span>
              </span>
            </div>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
            {thongKe.ptDaDuyet > 0 && (
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                style={{ width: `${thongKe.ptDaDuyet}%` }}
              />
            )}
            {thongKe.ptChoDuyet > 0 && (
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-700"
                style={{ width: `${thongKe.ptChoDuyet}%` }}
              />
            )}
          </div>
        </div>

        {/* Chỉ tiêu áp dụng */}
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-600 mb-2">Chỉ tiêu áp dụng:</p>
          <div className="flex flex-wrap gap-2">
            {nhiemVu.chiTieu.map(ct => (
              <span key={ct} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                {ct}
              </span>
            ))}
          </div>
        </div>

        {/* Chi tiết */}
        {nhiemVu.chiTiet && (
          <div className="mt-5">
            <p className="text-sm font-medium text-slate-600 mb-1.5">Chi tiết:</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
              {nhiemVu.chiTiet}
            </p>
          </div>
        )}

        {/* Đính kèm */}
        {nhiemVu.dinhKem && nhiemVu.dinhKem.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-medium text-slate-600 mb-2">Văn bản đính kèm:</p>
            <div className="space-y-2">
              {nhiemVu.dinhKem.map((file, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText size={18} className="text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.ten}</p>
                    {file.moTa && <p className="text-xs text-slate-500 mt-0.5">{file.moTa}</p>}
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{(file.kichThuoc / 1024).toFixed(0)} KB</span>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0 text-xs font-medium">
                    <Download size={14} />
                    Tải xuống
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tổng hợp chỉ tiêu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            Tổng hợp chỉ tiêu
            <span className="text-xs font-normal text-slate-400 ml-1">
              (từ {thongKe.daDuyet}/{thongKe.tongHo} hộ đã duyệt)
            </span>
          </h2>
          <div className="flex items-center gap-2">
            {coCTThonNhap && (
              <button
                onClick={() => setHienFormKeKhai(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-600/30 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-600/40 hover:bg-indigo-500 active:translate-y-0 active:scale-[0.98] active:shadow-sm"
              >
                <Edit3 size={16} />
                {Object.keys(duLieuThon).length > 0 ? 'Sửa kê khai thôn' : 'Kê khai chỉ tiêu thôn'}
              </button>
            )}
            <button
              onClick={() => setHienPopupChiTiet(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-500/25 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm"
            >
              <Database size={16} />
              Chi tiết kê khai
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {nhiemVu.chiTieu.map(ct => (
            <div key={ct} className={`flex flex-col px-4 py-3 rounded-xl border ${danhSachCTThonNhap.includes(ct) ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-semibold text-blue-600">{ct}</span>
                {danhSachCTThonNhap.includes(ct) && (
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">Thôn</span>
                )}
              </div>
              <span className="text-xs text-slate-500 mb-2 line-clamp-1">{danhSachCT[ct]}</span>
              <span className="text-xl font-bold text-slate-800">
                {danhSachCTThonNhap.includes(ct) && Object.keys(duLieuThon).length > 0
                  ? (duLieuThon[ct] ?? 0).toLocaleString('vi-VN')
                  : (tongHopCT[ct] ?? 0).toLocaleString('vi-VN')
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tiến độ các hộ dân — Kanban 3 cột */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Home size={20} className="text-blue-500" />
            Tiến độ hộ dân
          </h2>
        </div>

        {/* Thẻ thống kê 3 trạng thái */}
        {(() => {
          const hoChuaNop = danhSachHo.filter(h => !h.daNop || h.trangThaiDuyet === 'tu-choi')
          const hoChoDuyet = danhSachHo.filter(h => h.daNop && (h.trangThaiDuyet === 'cho-duyet' || !h.trangThaiDuyet) && h.trangThaiDuyet !== 'tu-choi')
          const hoDaDuyet = danhSachHo.filter(h => h.daNop && h.trangThaiDuyet === 'da-duyet')

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-700">{thongKe.chuaNop}</p>
                    <p className="text-xs text-slate-500">Chưa nộp</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-700">{thongKe.choDuyet}</p>
                    <p className="text-xs text-amber-600">Chờ duyệt</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-700">{thongKe.daDuyet}</p>
                    <p className="text-xs text-emerald-600">Đã duyệt</p>
                  </div>
                </div>
              </div>

              {/* Thanh tiến độ phân đoạn */}
              <div className="mb-6">
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  {thongKe.ptDaDuyet > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 ease-out"
                      style={{ width: `${thongKe.ptDaDuyet}%` }}
                    />
                  )}
                  {thongKe.ptChoDuyet > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-700 ease-out"
                      style={{ width: `${thongKe.ptChoDuyet}%` }}
                    />
                  )}
                </div>
              </div>

              {/* 3 cột kanban */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {/* Cột Chưa nộp */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-sm font-bold text-slate-600">Chưa nộp</span>
                    <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {thongKe.chuaNop}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {hoChuaNop.length > 0 ? (
                      hoChuaNop.map((ho, i) => {
                        const biTraLai = ho.trangThaiDuyet === 'tu-choi'
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                              biTraLai
                                ? 'bg-red-50/70 border-red-200 hover:border-red-300'
                                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                            } hover:shadow-sm`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              biTraLai ? 'bg-red-100' : 'bg-slate-100'
                            }`}>
                              {biTraLai
                                ? <XCircle size={16} className="text-red-500" />
                                : <Clock size={16} className="text-slate-400" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">{ho.ten}</p>
                              {biTraLai ? (
                                <p className="text-xs text-red-500 mt-0.5">Bị trả lại: {ho.lyDoTuChoi || 'Minh chứng không hợp lệ'}</p>
                              ) : (
                                <p className="text-xs text-slate-400 mt-0.5">Đang chờ kê khai</p>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="px-4 py-8 text-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                        <CheckCircle2 size={20} className="mx-auto text-emerald-400 mb-1" />
                        <p className="text-sm text-emerald-600 font-medium">Tất cả đã nộp!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cột Chờ duyệt — nổi bật nhất */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-bold text-amber-700">Chờ duyệt</span>
                    <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      {thongKe.choDuyet}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {hoChoDuyet.length > 0 ? (
                      hoChoDuyet.map((ho, i) => (
                        <div
                          key={i}
                          onClick={() => moPopupDuyet(ho)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer group/card"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={16} className="text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{ho.ten}</p>
                            <p className="text-xs text-amber-600 mt-0.5">Nộp ngày {dinhDangNgay(ho.ngayNop)} — Bấm để duyệt</p>
                          </div>
                          <button className="p-1.5 rounded-lg text-amber-400 hover:bg-white hover:text-amber-600 transition-colors opacity-0 group-hover/card:opacity-100 flex-shrink-0">
                            <Eye size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30">
                        <CheckCircle2 size={20} className="mx-auto text-amber-400 mb-1" />
                        <p className="text-sm text-amber-600 font-medium">Không có hộ nào chờ duyệt</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cột Đã duyệt */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700">Đã duyệt</span>
                    <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {thongKe.daDuyet}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {hoDaDuyet.length > 0 ? (
                      hoDaDuyet.map((ho, i) => (
                        <div
                          key={i}
                          onClick={() => moPopupDuyet(ho)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-200 cursor-pointer group/card"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{ho.ten}</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Nộp ngày {dinhDangNgay(ho.ngayNop)}</p>
                          </div>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-blue-600 transition-colors opacity-0 group-hover/card:opacity-100 flex-shrink-0">
                            <Eye size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-sm text-slate-400">Chưa có hộ dân nào được duyệt</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )
        })()}
      </div>

      <PopupChiTietHoDan
        hienPopup={hienPopupChiTiet}
        dongPopup={() => setHienPopupChiTiet(false)}
        nhiemVu={nhiemVu}
        danhSachHo={danhSachHo}
        tongHopCT={tongHopCT}
      />

      <FormKeKhaiThon
        hienPopup={hienFormKeKhai}
        dongPopup={() => setHienFormKeKhai(false)}
        nhiemVu={nhiemVu}
        duLieuThonDaNhap={duLieuThon}
        luuDuLieu={luuDuLieuThon}
        tongHopCT={tongHopCT}
        thongKe={thongKe}
      />

      <PopupDuyetKeKhai
        hienPopup={hienPopupDuyet}
        dongPopup={() => { setHienPopupDuyet(false); setHoCanDuyet(null) }}
        hoDan={hoCanDuyet}
        nhiemVu={nhiemVu}
        xuLyDuyet={xuLyDuyet}
      />
    </div>
  )
}
