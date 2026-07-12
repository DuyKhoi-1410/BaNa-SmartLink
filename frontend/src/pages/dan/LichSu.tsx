import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Loader2, History, FileText, CalendarDays } from 'lucide-react'
import { api } from '../../lib/api'

const formatNgay = (ngay) => {
  if (!ngay) return '—'
  const d = new Date(ngay)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatGio = (ngay) => {
  if (!ngay) return ''
  const d = new Date(ngay)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const cauHinhTrangThai = {
  da_ke_khai: { nhan: 'Chờ duyệt', mau: 'bg-amber-100 text-amber-700', icon: Clock, iconMau: 'text-amber-500', vienMau: 'border-l-amber-400' },
  da_duyet: { nhan: 'Đã duyệt', mau: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, iconMau: 'text-emerald-500', vienMau: 'border-l-emerald-500' },
  tra_lai: { nhan: 'Bị trả lại', mau: 'bg-red-100 text-red-700', icon: AlertCircle, iconMau: 'text-red-500', vienMau: 'border-l-red-400' },
}

const danhSachCTHien = [
  { key: 'ct02_tong_nhan_khau', ten: 'Tổng nhân khẩu' },
  { key: 'ct03_ho_ngheo', ten: 'Hộ nghèo', laCo: true },
  { key: 'ct04_ho_can_ngheo', ten: 'Hộ cận nghèo', laCo: true },
  { key: 'ct05_nguoi_co_cong', ten: 'Người có công' },
  { key: 'ct06_bao_tro_xh', ten: 'Bảo trợ xã hội' },
  { key: 'ct07_tre_duoi_16', ten: 'Trẻ dưới 16 tuổi' },
  { key: 'ct08_tre_hoan_canh', ten: 'Trẻ hoàn cảnh đặc biệt' },
  { key: 'ct10_tuoi_lao_dong', ten: 'Trong tuổi lao động' },
  { key: 'ct11_tham_gia_bhyt', ten: 'Tham gia BHYT' },
]

export default function LichSu() {
  const [lichSu, setLichSu] = useState([])
  const [dangTai, setDangTai] = useState(true)
  const [moRongId, setMoRongId] = useState(null)

  useEffect(() => {
    api.get('/declarations/me')
      .then(data => setLichSu(data))
      .catch(() => setLichSu([]))
      .finally(() => setDangTai(false))
  }, [])

  const batTatMoRong = (id) => {
    setMoRongId(prev => prev === id ? null : id)
  }

  if (dangTai) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-500 text-sm">Đang tải lịch sử...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Tiêu đề */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <History size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Lịch sử kê khai</h1>
            <p className="text-slate-500 text-sm">Bạn đã kê khai {lichSu.length} lần</p>
          </div>
        </div>
      </div>

      {/* Danh sách */}
      {lichSu.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold text-lg mb-1">Chưa có lịch sử kê khai</p>
          <p className="text-slate-400 text-sm">Khi bạn kê khai xong, lịch sử sẽ hiện ở đây</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lichSu.map((kk) => {
            const tt = cauHinhTrangThai[kk.trang_thai] || cauHinhTrangThai.da_ke_khai
            const IconTT = tt.icon
            const dangMoRong = moRongId === kk.id

            return (
              <div key={kk.id} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${tt.vienMau} overflow-hidden transition-shadow hover:shadow-md`}>
                {/* Header — bấm để mở rộng */}
                <button
                  onClick={() => batTatMoRong(kk.id)}
                  className="w-full text-left px-4 py-4 flex items-center gap-3"
                >
                  {/* Icon trạng thái */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tt.mau.split(' ')[0]}`}>
                    <IconTT size={20} className={tt.iconMau} />
                  </div>

                  {/* Nội dung chính */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-base truncate">
                      {kk.ten_dot || `Đợt kê khai #${kk.dot_id}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <CalendarDays size={12} />
                        {formatNgay(kk.ngay_ke_khai)}
                      </span>
                      {kk.loai && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          kk.loai === 'dot_xuat' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {kk.loai === 'dot_xuat' ? 'Đột xuất' : 'Định kỳ'}
                        </span>
                      )}
                      {kk.phien_ban > 1 && (
                        <span className="text-xs text-slate-400">
                          Lần sửa {kk.phien_ban - 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge trạng thái + mũi tên */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tt.mau}`}>
                      {tt.nhan}
                    </span>
                    {dangMoRong ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </button>

                {/* Nội dung mở rộng */}
                {dangMoRong && (
                  <div className="px-4 pb-4 border-t border-slate-100">
                    {/* Lý do trả lại (nếu có) */}
                    {kk.trang_thai === 'tra_lai' && kk.ly_do_tra_lai && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-lg px-3 py-2.5 border border-red-200">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-700 mb-0.5">Lý do trả lại:</p>
                          <p className="text-sm text-red-600">{kk.ly_do_tra_lai}</p>
                        </div>
                      </div>
                    )}

                    {/* Trạng thái duyệt */}
                    {kk.trang_thai === 'da_duyet' && kk.ngay_duyet && (
                      <div className="mt-3 flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2.5 border border-emerald-200">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        <p className="text-sm text-emerald-700">
                          Đã duyệt ngày {formatNgay(kk.ngay_duyet)} lúc {formatGio(kk.ngay_duyet)}
                        </p>
                      </div>
                    )}

                    {/* Bảng chỉ tiêu đã kê khai */}
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Dữ liệu đã kê khai
                      </p>
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        {danhSachCTHien.map((ct, i) => {
                          const giaTriGoc = kk[ct.key]
                          const giaTri = giaTriGoc !== null && giaTriGoc !== undefined ? Number(giaTriGoc) : null
                          if (giaTri === null) return null

                          const hienThi = ct.laCo
                            ? (giaTri === 1 ? 'Có' : 'Không')
                            : giaTri.toLocaleString('vi-VN')

                          return (
                            <div key={ct.key} className={`flex items-center justify-between px-3 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                              <span className="text-sm text-slate-600">{ct.ten}</span>
                              <span className={`text-sm font-bold ${ct.laCo ? (giaTri === 1 ? 'text-emerald-600' : 'text-slate-400') : 'text-slate-800'}`}>
                                {hienThi}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Thông tin đợt */}
                    {(kk.ngay_bat_dau || kk.ngay_ket_thuc) && (
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        {kk.ngay_bat_dau && <span>Đợt bắt đầu: {formatNgay(kk.ngay_bat_dau)}</span>}
                        {kk.ngay_ket_thuc && <span>Hết hạn: {formatNgay(kk.ngay_ket_thuc)}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
