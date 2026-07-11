import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Clock,
  FileText,
  CheckCheck,
  Circle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { api } from '../../lib/api'

const cauHinhLoai = {
  bao_cao_moi: {
    icon: FileText,
    mauIcon: 'text-violet-500',
    mauNen: 'bg-violet-50',
    mauVien: 'border-violet-200',
    nhan: 'Đợt mới',
    mauNhan: 'text-violet-700 bg-violet-100',
  },
  nhac_1_ngay: {
    icon: Clock,
    mauIcon: 'text-amber-500',
    mauNen: 'bg-amber-50',
    mauVien: 'border-amber-200',
    nhan: 'Còn 1 ngày',
    mauNhan: 'text-amber-700 bg-amber-100',
  },
  nhac_2_ngay: {
    icon: Clock,
    mauIcon: 'text-blue-500',
    mauNen: 'bg-blue-50',
    mauVien: 'border-blue-200',
    nhan: 'Còn 2 ngày',
    mauNhan: 'text-blue-700 bg-blue-100',
  },
  yeu_cau_sua: {
    icon: AlertTriangle,
    mauIcon: 'text-orange-500',
    mauNen: 'bg-orange-50',
    mauVien: 'border-orange-200',
    nhan: 'Cần sửa',
    mauNhan: 'text-orange-700 bg-orange-100',
  },
  da_duyet: {
    icon: CheckCircle2,
    mauIcon: 'text-emerald-600',
    mauNen: 'bg-emerald-50',
    mauVien: 'border-emerald-200',
    nhan: 'Đã duyệt',
    mauNhan: 'text-emerald-700 bg-emerald-100',
  },
}

function formatThoiGian(ngay) {
  const d = new Date(ngay)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' — ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function mapLoaiThongBao(loai) {
  const map = {
    he_thong: 'bao_cao_moi',
    nhac_viec: 'nhac_1_ngay',
    dot_moi: 'bao_cao_moi',
    duyet: 'da_duyet',
    tra_lai: 'yeu_cau_sua',
    bao_cao_moi: 'bao_cao_moi',
    da_duyet: 'da_duyet',
    yeu_cau_sua: 'yeu_cau_sua',
    nhac_1_ngay: 'nhac_1_ngay',
    nhac_2_ngay: 'nhac_2_ngay',
  }
  return map[loai] || 'bao_cao_moi'
}

export default function ThongBaoDan() {
  const [danhSach, setDanhSach] = useState([])
  const [dangTai, setDangTai] = useState(true)
  const [tabHienTai, setTabHienTai] = useState('tat_ca')
  const navigate = useNavigate()

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const data = await api.get('/notifications')
        const mapped = data.map(tb => ({
          id: tb.id,
          loai: mapLoaiThongBao(tb.loai),
          tieuDe: tb.tieu_de,
          noiDung: tb.noi_dung,
          thoiGian: formatThoiGian(tb.created_at),
          daDoc: tb.da_doc || false,
        }))
        setDanhSach(mapped)
      } catch (err) {
        console.error('Loi tai thong bao:', err)
      } finally {
        setDangTai(false)
      }
    }
    taiDuLieu()
  }, [])

  const soThongBaoChuaDoc = danhSach.filter(tb => !tb.daDoc).length

  const danhSachHienThi = tabHienTai === 'chua_doc'
    ? danhSach.filter(tb => !tb.daDoc)
    : danhSach

  const xuLyClickThongBao = (tb) => {
    if (!tb.daDoc) {
      setDanhSach(prev =>
        prev.map(item => item.id === tb.id ? { ...item, daDoc: true } : item)
      )
      api.patch(`/notifications/${tb.id}/doc`).catch(() => {})
    }
    navigate('/dan/ke-khai')
  }

  const danhDauTatCaDaDoc = () => {
    setDanhSach(prev => prev.map(tb => ({ ...tb, daDoc: true })))
  }

  if (dangTai) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bell className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Thông Báo</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Thông báo từ thôn và hệ thống</p>
          </div>
        </div>

        {soThongBaoChuaDoc > 0 && (
          <button
            onClick={danhDauTatCaDaDoc}
            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600
              hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md
              active:translate-y-0 active:scale-[0.98] active:shadow-sm
              transition-all duration-300 ease-out"
          >
            <CheckCheck size={18} className="text-blue-500" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Thanh trượt Tab */}
      <div className="relative flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm w-fit mb-5">
        <div
          className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-md shadow-blue-500/25 transition-all duration-300 ease-out"
          style={{
            left: tabHienTai === 'tat_ca' ? '4px' : '50%',
            width: 'calc(50% - 4px)',
          }}
        />
        <button
          onClick={() => setTabHienTai('tat_ca')}
          className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300
            ${tabHienTai === 'tat_ca' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Tất cả
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold transition-colors duration-300
            ${tabHienTai === 'tat_ca' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {danhSach.length}
          </span>
        </button>
        <button
          onClick={() => setTabHienTai('chua_doc')}
          className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300
            ${tabHienTai === 'chua_doc' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Chưa đọc
          {soThongBaoChuaDoc > 0 && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold transition-colors duration-300
              ${tabHienTai === 'chua_doc' ? 'bg-white/25 text-white' : 'bg-red-100 text-red-600'}`}>
              {soThongBaoChuaDoc}
            </span>
          )}
        </button>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {danhSachHienThi.length > 0 ? (
          danhSachHienThi.map(tb => {
            const cauHinh = cauHinhLoai[tb.loai]
            const IconLoai = cauHinh.icon

            return (
              <button
                key={tb.id}
                onClick={() => xuLyClickThongBao(tb)}
                className={`w-full text-left rounded-xl border p-5 transition-all duration-300 ease-out
                  ${!tb.daDoc
                    ? `${cauHinh.mauNen} ${cauHinh.mauVien} hover:-translate-y-0.5 hover:shadow-lg cursor-pointer`
                    : 'bg-white border-slate-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
                  }
                  active:translate-y-0 active:scale-[0.995] active:shadow-sm`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${!tb.daDoc ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                    <IconLoai size={22} className={cauHinh.mauIcon} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className={`text-sm font-bold ${!tb.daDoc ? 'text-slate-800' : 'text-slate-600'}`}>
                        {tb.tieuDe}
                      </h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cauHinh.mauNhan}`}>
                        {cauHinh.nhan}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${!tb.daDoc ? 'text-slate-700' : 'text-slate-500'}`}>
                      {tb.noiDung}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                      <Clock size={12} />
                      {tb.thoiGian}
                    </p>
                  </div>

                  <div className="flex-shrink-0 pt-1">
                    {!tb.daDoc ? (
                      <div className="relative">
                        <Circle size={14} className="text-blue-500 fill-blue-500" />
                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
                      </div>
                    ) : (
                      <Circle size={14} className="text-slate-200" />
                    )}
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold text-lg">Không có thông báo</p>
            <p className="text-sm text-slate-400 mt-1">
              {tabHienTai === 'chua_doc' ? 'Bạn đã đọc tất cả thông báo' : 'Chưa có thông báo nào từ hệ thống'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
