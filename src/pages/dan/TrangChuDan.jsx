import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, AlertCircle, CheckCircle2, CalendarDays, Home, Users, MapPin, Bell, Megaphone, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import anhNen from '../../assets/cauvang1k.jpg'

const thuTrongTuan = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const thangTrongNam = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

function layNgayHienTai() {
  const now = new Date()
  return `${thuTrongTuan[now.getDay()]}, ${now.getDate()} Tháng ${thangTrongNam[now.getMonth()]}, ${now.getFullYear()}`
}

export default function TrangChuDan() {
  const navigate = useNavigate()
  const { nguoiDung } = useAuth()
  const [soDotChuaKeKhai, setSoDotChuaKeKhai] = useState(0)
  const [thongTinHo, setThongTinHo] = useState({ soNhanKhau: 0, diaChi: '' })
  const [danhSachThongBao, setDanhSachThongBao] = useState([])
  const [dangTai, setDangTai] = useState(true)

  useEffect(() => {
    if (!nguoiDung) return
    const taiDuLieu = async () => {
      setDangTai(true)
      try {
        const [periods, declarations, household, notifications] = await Promise.all([
          api.get('/periods').catch(() => []),
          api.get('/declarations/me').catch(() => []),
          api.get('/households/me').catch(() => null),
          api.get('/notifications').catch(() => []),
        ])
        const homNay = new Date().toISOString().slice(0, 10)
        const dotHoatDong = Array.isArray(periods)
          ? periods.filter(d => (d.trang_thai === 'dang_mo' || d.trang_thai === 'dang_dien_ra') && d.ngay_ket_thuc?.slice(0, 10) >= homNay)
          : []
        const dotDaKeKhai = new Set(
          Array.isArray(declarations) ? declarations.map(kk => kk.dot_id) : []
        )
        const dotChuaKeKhai = dotHoatDong.filter(d => !dotDaKeKhai.has(d.id))
        setSoDotChuaKeKhai(dotChuaKeKhai.length)

        if (household) {
          setThongTinHo({
            soNhanKhau: household.so_nhan_khau || 0,
            diaChi: household.dia_chi || '',
          })
        }

        const thongBaoGanDay = (Array.isArray(notifications) ? notifications : [])
          .slice(0, 5)
          .map(tb => ({
            id: tb.id,
            loai: tb.loai === 'yeu_cau_sua' || tb.loai === 'tra_lai' ? 'nhac-viec' : 'thong-bao',
            noiDung: tb.noi_dung || tb.tieu_de,
            thoiGian: tb.created_at
              ? new Date(tb.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '',
          }))
        setDanhSachThongBao(thongBaoGanDay)
      } catch {}
      setDangTai(false)
    }
    taiDuLieu()
  }, [nguoiDung])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">
      {/* Khung chào mừng */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg shadow-indigo-900/10">
        <img
          src={anhNen}
          alt="Ảnh nền"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
        <div className="relative z-10 px-5 py-6 md:px-10 md:py-9">
          <p className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-2">Chào mừng đến với</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight"><span className="text-yellow-200">BA NA</span> SmartLink</h1>
          <p className="text-white/60 text-sm mt-1">Xã Bà Nà · Tp. Đà Nẵng</p>
          <div className="mt-5 pt-5 border-t border-white/15">
            <p className="text-white text-lg font-semibold">Chào anh/chị {nguoiDung?.ho_ten || 'Người dùng'}</p>
            <div className="flex items-center gap-1.5 mt-1 text-white/50 text-sm">
              <CalendarDays size={14} />
              <span>{layNgayHienTai()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Box nhắc việc */}
      {soDotChuaKeKhai > 0 ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={24} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-lg md:text-xl font-bold text-slate-800">
                Bạn có {soDotChuaKeKhai} đợt chưa kê khai
              </p>
              <p className="text-sm text-slate-500 mt-0.5">Vui lòng hoàn thành trước hạn nộp</p>
            </div>
            <button
              onClick={() => navigate('/dan/ke-khai')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl
                hover:bg-amber-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/25
                transition-all duration-300 active:scale-[0.98] flex-shrink-0"
            >
              Kê khai ngay
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => navigate('/dan/ke-khai')}
            className="sm:hidden w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 text-white text-sm font-semibold rounded-xl
              active:scale-[0.98] transition-all duration-200"
          >
            Kê khai ngay
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 md:p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-slate-800">Đã hoàn thành tất cả</p>
            <p className="text-sm text-slate-500 mt-0.5">Không có đợt kê khai nào cần làm</p>
          </div>
        </div>
      )}

      {/* Thông tin hộ gia đình */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Home size={18} className="text-blue-600" />
          <h2 className="text-base font-bold text-slate-800">Thông tin hộ gia đình</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Chủ hộ</p>
              <p className="text-sm font-semibold text-slate-800">{nguoiDung?.ho_ten || 'Người dùng'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Số nhân khẩu</p>
              <p className="text-sm font-semibold text-slate-800">{thongTinHo.soNhanKhau} người</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Thôn</p>
              <p className="text-sm font-semibold text-slate-800">{nguoiDung?.ten_thon || 'Chưa rõ'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Địa chỉ</p>
              <p className="text-sm font-semibold text-slate-800">{thongTinHo.diaChi || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo gần đây */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Thông báo gần đây</h2>
          </div>
          <button
            onClick={() => navigate('/dan/thong-bao')}
            className="text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Xem tất cả
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {danhSachThongBao.map((tb) => (
            <div key={tb.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                ${tb.loai === 'nhac-viec' ? 'bg-red-50' : 'bg-blue-50'}`}>
                {tb.loai === 'nhac-viec'
                  ? <Clock size={16} className="text-red-500" />
                  : <Megaphone size={16} className="text-blue-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{tb.noiDung}</p>
                <p className="text-xs text-slate-400 mt-1">{tb.thoiGian}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
