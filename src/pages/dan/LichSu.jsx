import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle2, Clock, AlertCircle, Calendar, ChevronRight, Search, Filter, ClipboardList, Send, Eye, Pencil, RotateCcw, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

const formatNgay = (ngay) => {
  const d = new Date(ngay)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const cauHinhTrangThai = {
  'da-duyet': { nhan: 'Đã duyệt', mau: 'emerald', icon: CheckCircle2 },
  'hoan-thanh': { nhan: 'Hoàn thành', mau: 'blue', icon: CheckCircle2 },
  'cho-duyet': { nhan: 'Chờ duyệt', mau: 'amber', icon: Clock },
  'tu-choi': { nhan: 'Từ chối', mau: 'red', icon: AlertCircle },
}

const cauHinhLoai = {
  'ke-khai': { nhan: 'Kê khai', icon: ClipboardList, mau: 'indigo' },
  'cap-nhat': { nhan: 'Cập nhật', icon: Pencil, mau: 'slate' },
}

const danhSachBoLoc = [
  { key: 'tat-ca', nhan: 'Tất cả' },
  { key: 'ke-khai', nhan: 'Kê khai' },
  { key: 'cap-nhat', nhan: 'Cập nhật' },
]

const mauNen = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  indigo: 'bg-indigo-50 text-indigo-600',
  slate: 'bg-slate-100 text-slate-600',
}

const mauIcon = {
  emerald: 'text-emerald-500',
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  red: 'text-red-500',
}

function chuyenDoiKeKhai(kk) {
  const mapTrangThai = {
    da_ke_khai: 'cho-duyet',
    da_duyet: 'da-duyet',
    tra_lai: 'tu-choi',
    giu_nguyen: 'da-duyet',
  }
  const trangThai = mapTrangThai[kk.trang_thai] || 'cho-duyet'
  const isUpdate = kk.phien_ban > 1
  return {
    id: kk.id,
    loai: isUpdate ? 'cap-nhat' : 'ke-khai',
    tieuDe: kk.ten_dot || `Đợt kê khai #${kk.dot_id}`,
    trangThai,
    ngayNop: kk.ngay_ke_khai || kk.created_at,
    ngayThucHien: kk.ngay_ke_khai || kk.created_at,
    loaiDot: kk.loai_dot === 'dinh_ky' ? 'dinh-ky' : 'dot-xuat',
    soChiTieu: 14,
    ghiChu: kk.ly_do_tra_lai || '',
  }
}

export default function LichSu() {
  const navigate = useNavigate()
  const [boLoc, setBoLoc] = useState('tat-ca')
  const [tuKhoa, setTuKhoa] = useState('')
  const [lichSuHoatDong, setLichSuHoatDong] = useState([])
  const [dangTai, setDangTai] = useState(true)

  useEffect(() => {
    const taiLichSu = async () => {
      setDangTai(true)
      try {
        const data = await api.get('/declarations/me')
        const keKhaiDaNop = (Array.isArray(data) ? data : [])
          .filter(kk => kk.trang_thai && kk.trang_thai !== 'chua_ke_khai')
          .map(chuyenDoiKeKhai)
          .sort((a, b) => new Date(b.ngayNop) - new Date(a.ngayNop))
        setLichSuHoatDong(keKhaiDaNop)
      } catch {}
      setDangTai(false)
    }
    taiLichSu()
  }, [])

  const danhSachLoc = lichSuHoatDong.filter(item => {
    if (boLoc !== 'tat-ca' && item.loai !== boLoc) return false
    if (tuKhoa.trim()) {
      const tu = tuKhoa.toLowerCase()
      return item.tieuDe.toLowerCase().includes(tu) || (item.ghiChu && item.ghiChu.toLowerCase().includes(tu))
    }
    return true
  })

  const tongKeKhai = lichSuHoatDong.filter(i => i.loai === 'ke-khai').length
  const tongDaDuyet = lichSuHoatDong.filter(i => i.trangThai === 'da-duyet').length
  const tongTuChoi = lichSuHoatDong.filter(i => i.trangThai === 'tu-choi').length

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lịch Sử Kê Khai</h1>
        <p className="text-slate-500 mt-1 text-sm">Xem lại những gì bạn đã thực hiện trên hệ thống</p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{tongKeKhai}</div>
          <div className="text-xs sm:text-sm text-slate-500 mt-1">Lần kê khai</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{tongDaDuyet}</div>
          <div className="text-xs sm:text-sm text-slate-500 mt-1">Đã duyệt</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-500">{tongTuChoi}</div>
          <div className="text-xs sm:text-sm text-slate-500 mt-1">Từ chối</div>
        </div>
      </div>

      {/* Bộ lọc + Tìm kiếm */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {danhSachBoLoc.map(tab => (
            <button
              key={tab.key}
              onClick={() => setBoLoc(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                boLoc === tab.key
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.nhan}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm theo tên đợt hoặc ghi chú..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* Danh sách lịch sử */}
      {danhSachLoc.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Không tìm thấy hoạt động nào</p>
          <p className="text-slate-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="space-y-3">
          {danhSachLoc.map((item) => {
            const trangThai = cauHinhTrangThai[item.trangThai]
            const loai = cauHinhLoai[item.loai]
            const IconTrangThai = trangThai.icon
            const IconLoai = loai.icon
            const ngayHienThi = item.ngayNop || item.ngayThucHien

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Icon loại */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${mauNen[loai.mau]}`}>
                    <IconLoai size={20} />
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-snug">{item.tieuDe}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar size={13} />
                            {formatNgay(ngayHienThi)}
                          </span>
                          {item.loaiDot && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.loaiDot === 'dinh-ky' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {item.loaiDot === 'dinh-ky' ? 'Định kỳ' : 'Đột xuất'}
                            </span>
                          )}
                          {item.soChiTieu && (
                            <span className="text-xs text-slate-400">
                              {item.soChiTieu} chỉ tiêu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge trạng thái */}
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${mauNen[trangThai.mau]}`}>
                        <IconTrangThai size={13} className={mauIcon[trangThai.mau]} />
                        <span className="hidden sm:inline">{trangThai.nhan}</span>
                      </div>
                    </div>

                    {/* Ghi chú */}
                    {item.ghiChu && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">
                        {item.ghiChu}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tổng số */}
      <div className="text-center text-sm text-slate-400 pb-4">
        Hiển thị {danhSachLoc.length} / {lichSuHoatDong.length} hoạt động
      </div>
    </div>
  )
}
