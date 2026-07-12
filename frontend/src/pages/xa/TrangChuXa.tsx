import { useState, useEffect, useMemo } from 'react'
import { CalendarDays, ChevronDown, Home, Users, FileText, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import anhNen from '../../assets/cauvang1k.jpg'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const danhSachAnh = [anhNen]
const THOI_GIAN_CHUYEN = 5000

const thuTrongTuan = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const thangTrongNam = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const danhSachCT = [
  { ma: 'CT01', ten: 'Tổng số hộ dân', icon: '🏠' },
  { ma: 'CT02', ten: 'Tổng số nhân khẩu', icon: '👥' },
  { ma: 'CT03', ten: 'Số hộ nghèo', icon: '📋' },
  { ma: 'CT04', ten: 'Số hộ cận nghèo', icon: '📝' },
  { ma: 'CT05', ten: 'Người có công với CM', icon: '⭐' },
  { ma: 'CT06', ten: 'Đối tượng bảo trợ XH', icon: '🤝' },
  { ma: 'CT07', ten: 'Trẻ em dưới 16 tuổi', icon: '👶' },
  { ma: 'CT08', ten: 'Trẻ em hoàn cảnh ĐB', icon: '💛' },
  { ma: 'CT09', ten: 'Hộ "Gia đình văn hóa"', icon: '🏆' },
  { ma: 'CT10', ten: 'Người trong tuổi LĐ', icon: '💼' },
  { ma: 'CT11', ten: 'Người tham gia BHYT', icon: '🏥' },
  { ma: 'CT12', ten: 'Thành viên Tổ CNSCĐ', icon: '🔧' },
  { ma: 'CT13', ten: 'Hướng dẫn DVC trực tuyến', icon: '💻' },
  { ma: 'CT14', ten: 'Vụ bạo lực gia đình', icon: '⚠️' },
]

const fieldMap = {
  CT01: 'ct01_tong_ho', CT02: 'ct02_tong_nhan_khau', CT03: 'ct03_ho_ngheo',
  CT04: 'ct04_ho_can_ngheo', CT05: 'ct05_nguoi_co_cong', CT06: 'ct06_bao_tro_xh',
  CT07: 'ct07_tre_duoi_16', CT08: 'ct08_tre_hoan_canh', CT09: 'ct09_gia_dinh_van_hoa',
  CT10: 'ct10_tuoi_lao_dong', CT11: 'ct11_tham_gia_bhyt',
  CT12: 'ct12_thanh_vien_to_cnsc', CT13: 'ct13_huong_dan_dvc', CT14: 'ct14_bao_luc_gia_dinh',
}

const MAU_THANH = '#2a78d6'

const MAU_DONUT = ['#1baf7a', '#e34948', '#e1e0d9']

function dinhDangSo(so) {
  if (so === null || so === undefined) return '—'
  return so.toLocaleString('vi-VN')
}

function layNgayHienTai() {
  const now = new Date()
  return `${thuTrongTuan[now.getDay()]}, ${now.getDate()} Tháng ${thangTrongNam[now.getMonth()]}, ${now.getFullYear()}`
}

function TickTenThon({ x, y, payload }: any) {
  const cacTu = payload.value.split(' ')
  return (
    <text x={x} y={y + 10} textAnchor="middle" fill="#898781" fontSize={10}>
      {cacTu.map((tu, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>{tu}</tspan>
      ))}
    </text>
  )
}

function TooltipTuyChinh({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-slate-600">Giá trị: <span className="font-bold text-blue-600">{dinhDangSo(payload[0].value)}</span></p>
    </div>
  )
}

export default function TrangChuXa() {
  const { nguoiDung } = useAuth()
  const [anhHienTai, setAnhHienTai] = useState(0)
  const [dangTai, setDangTai] = useState(true)
  const [danhSachBaoCao, setDanhSachBaoCao] = useState([])
  const [baoCaoChon, setBaoCaoChon] = useState(null)
  const [moDropdownBC, setMoDropdownBC] = useState(false)
  const [thanhHover, setThanhHover] = useState(null)
  const [ctChon, setCtChon] = useState('CT01')
  const [moDropdownCT, setMoDropdownCT] = useState(false)
  const [ctTop5Thon, setCtTop5Thon] = useState('CT01')
  const [moDropdownTop5Thon, setMoDropdownTop5Thon] = useState(false)
  const [tongHopCT, setTongHopCT] = useState([])
  const [duLieuCTTheoThon, setDuLieuCTTheoThon] = useState({})
  const [soNhiemVuHoatDong, setSoNhiemVuHoatDong] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnhHienTai((prev) => (prev + 1) % danhSachAnh.length)
    }, THOI_GIAN_CHUYEN)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const periods = await api.get('/periods')

        const homNay = new Date().toISOString().slice(0, 10)
        setSoNhiemVuHoatDong(periods.filter(p => p.ngay_ket_thuc >= homNay).length)

        const tienDoPromises = periods.map(dot =>
          api.get(`/reports/tien-do/${dot.id}`).catch(() => [])
        )
        const tongHopPromise = periods[0]
          ? api.get(`/reports/tong-hop/${periods[0].id}`).catch(() => [])
          : Promise.resolve([])

        const [tienDoResults, tongHopXa] = await Promise.all([
          Promise.all(tienDoPromises),
          tongHopPromise,
        ])

        const dsBaoCao = periods.map((dot, i) => {
          const tienDoAll = tienDoResults[i]
          const tongSoThon = tienDoAll.length || 10
          const soThonDaNop = tienDoAll.filter(t => (parseInt(t.da_ke_khai) || 0) > 0).length
          return { id: dot.id, ten: dot.ten_dot, ngayHetHan: dot.ngay_ket_thuc, soThonDaNop, tongSoThon }
        })
        setDanhSachBaoCao(dsBaoCao)
        if (dsBaoCao.length > 0) setBaoCaoChon(dsBaoCao[0].id)

        if (tongHopXa.length > 0) {
          const duLieuThon = {}
          const tongXa = {}
          tongHopXa.forEach(thon => {
            const ctData = {}
            danhSachCT.forEach(ct => {
              const val = parseInt(thon[fieldMap[ct.ma]]) || 0
              ctData[ct.ma] = val
              tongXa[ct.ma] = (tongXa[ct.ma] || 0) + val
            })
            duLieuThon[thon.ten_thon] = ctData
          })
          setDuLieuCTTheoThon(duLieuThon)
          setTongHopCT(danhSachCT.map(ct => ({
            ma: ct.ma,
            ten: ct.ten,
            giaTri: tongXa[ct.ma] || 0,
          })))
        }
      } catch (err) {
        console.error('Loi tai du lieu trang chu xa:', err)
      } finally {
        setDangTai(false)
      }
    }
    taiDuLieu()
  }, [])

  const duLieuBieuDo = tongHopCT

  const baoCaoHienTai = danhSachBaoCao.find(bc => bc.id === baoCaoChon) || { soThonDaNop: 0, tongSoThon: 10, ten: '' }
  const phanTramNop = baoCaoHienTai.tongSoThon > 0 ? Math.round((baoCaoHienTai.soThonDaNop / baoCaoHienTai.tongSoThon) * 100) : 0

  const duLieuDonut = [
    { ten: 'Đã nộp', giaTri: baoCaoHienTai.soThonDaNop },
    { ten: 'Chưa nộp', giaTri: baoCaoHienTai.tongSoThon - baoCaoHienTai.soThonDaNop },
  ]

  const duLieuTheoThon = useMemo(() => {
    return Object.entries(duLieuCTTheoThon).map(([ten, data]) => ({
      ten,
      tenDay: ten,
      giaTri: data[ctChon] ?? 0,
    }))
  }, [ctChon, duLieuCTTheoThon])

  const top5Thon = useMemo(() => {
    return Object.entries(duLieuCTTheoThon)
      .map(([ten, data]) => ({ ten, giaTri: data[ctTop5Thon] ?? 0 }))
      .filter(t => t.giaTri > 0)
      .sort((a, b) => b.giaTri - a.giaTri)
      .slice(0, 5)
  }, [ctTop5Thon, duLieuCTTheoThon])

  const ctTop5ThonHienTai = danhSachCT.find(ct => ct.ma === ctTop5Thon)

  const cardKPI = [
    { ten: 'Tổng số hộ dân', giaTri: tongHopCT.find(d => d.ma === 'CT01')?.giaTri || 0, icon: Home, mauIcon: 'text-rose-500', mauNen: 'bg-rose-50' },
    { ten: 'Tổng số nhân khẩu', giaTri: tongHopCT.find(d => d.ma === 'CT02')?.giaTri || 0, icon: Users, mauIcon: 'text-emerald-500', mauNen: 'bg-emerald-50' },
    { ten: 'Nhiệm vụ đang hoạt động', giaTri: soNhiemVuHoatDong, icon: FileText, mauIcon: 'text-amber-500', mauNen: 'bg-amber-50' },
  ]

  const ctHienTai = danhSachCT.find(ct => ct.ma === ctChon)

  if (dangTai) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-8">
      {/* ── Khung chào mừng ── */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg shadow-indigo-900/10">
        {danhSachAnh.map((anh, i) => (
          <img
            key={i}
            src={anh}
            alt={`Ảnh nền ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === anhHienTai ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
        <div className="relative z-10 px-5 py-6 md:px-10 md:py-9">
          <p className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-2">Chào mừng đến với</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight"><span className="text-yellow-200">BA NA</span> SmartLink</h1>
          <p className="text-white/60 text-sm mt-1">Xã Bà Nà · Tp. Đà Nẵng</p>
          <div className="mt-5 pt-5 border-t border-white/15">
            <p className="text-white text-lg font-semibold">{nguoiDung?.ho_ten || 'Cán bộ xã'}</p>
            <div className="flex items-center gap-1.5 mt-1 text-white/50 text-sm">
              <CalendarDays size={14} />
              <span>{layNgayHienTai()}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5">
          {danhSachAnh.map((_, i) => (
            <button
              key={i}
              onClick={() => setAnhHienTai(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === anhHienTai ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>

      {/* ── Hàng KPI — 3 thẻ pastel ── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 md:mt-8 md:gap-4">
        {cardKPI.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className={`${card.mauNen} rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md`}
            >
              <div className={`w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0`}>
                <Icon size={28} className={card.mauIcon} />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-800 block">{dinhDangSo(card.giaTri)}</span>
                <span className="text-base text-slate-500 leading-tight">{card.ten}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Hàng giữa — Biểu đồ thanh ngang (trái) + Biểu đồ cột theo thôn (phải) ── */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 md:mt-5 md:gap-5">
        {/* Trái: Biểu đồ thanh ngang CT01-CT14 thời gian thực */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-bold text-slate-700 mb-4">Tổng Hợp Chỉ Tiêu Toàn Xã Theo Thời Gian Thực</p>
          <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2.5">
            {(() => {
              const giaTriMax = Math.max(...duLieuBieuDo.map(d => d.giaTri))
              return duLieuBieuDo.map((ct, index) => {
                const tiLe = giaTriMax > 0 ? Math.pow(ct.giaTri / giaTriMax, 0.45) * 80 : 0
                const dangHover = thanhHover === index
                return (
                  <div
                    key={ct.ma}
                    className="cursor-default"
                    onMouseEnter={() => setThanhHover(index)}
                    onMouseLeave={() => setThanhHover(null)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[48px] flex-shrink-0 text-right">
                        <span className={`text-xs font-bold transition-colors duration-100 ${dangHover ? 'text-blue-600' : 'text-slate-500'}`}>
                          {ct.ma}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 relative h-5 bg-slate-100 rounded overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded transition-all duration-150 ease-out"
                            style={{
                              width: `${tiLe}%`,
                              backgroundColor: dangHover ? '#1c5cab' : MAU_THANH,
                              opacity: dangHover ? 1 : 0.85,
                            }}
                          />
                        </div>
                        <span className={`text-xs font-bold flex-shrink-0 w-[48px] transition-colors duration-100 ${dangHover ? 'text-blue-600' : 'text-slate-700'}`}>
                          {dinhDangSo(ct.giaTri)}
                        </span>
                      </div>
                    </div>
                    <p className={`ml-[60px] text-[10px] mt-0.5 transition-colors duration-100 ${dangHover ? 'text-blue-500' : 'text-slate-400'}`}>
                      {ct.ten}
                    </p>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* Phải: Biểu đồ cột theo thôn */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-700">Chỉ Tiêu Theo Thôn</p>
            <div className="relative">
              <button
                onClick={() => setMoDropdownCT(!moDropdownCT)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span>{ctHienTai?.ma} — {ctHienTai?.ten}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${moDropdownCT ? 'rotate-180' : ''}`} />
              </button>
              {moDropdownCT && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoDropdownCT(false)} />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {danhSachCT.map(ct => (
                      <button
                        key={ct.ma}
                        onClick={() => { setCtChon(ct.ma); setMoDropdownCT(false) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${ct.ma === ctChon ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {ct.ma} — {ct.ten}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={duLieuTheoThon} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="ten" tick={<TickTenThon />} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} height={55} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#898781' }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<TooltipTuyChinh />} cursor={{ fill: 'rgba(42, 120, 214, 0.06)' }} />
                <Bar dataKey="giaTri" fill={MAU_THANH} radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={true} animationDuration={500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Hàng cuối — Top 5 thôn (trái) + Tiến độ nộp donut (giữa) + Top 5 CT (phải) ── */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 md:mt-5 md:gap-5">
        {/* Trái: Top 5 thôn theo CT — có dropdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-700">Top 5 Thôn Chỉ Tiêu Cao Nhất</p>
            <div className="relative">
              <button
                onClick={() => setMoDropdownTop5Thon(!moDropdownTop5Thon)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span>{ctTop5ThonHienTai?.ma} — {ctTop5ThonHienTai?.ten.length > 12 ? ctTop5ThonHienTai?.ten.slice(0, 11) + '…' : ctTop5ThonHienTai?.ten}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${moDropdownTop5Thon ? 'rotate-180' : ''}`} />
              </button>
              {moDropdownTop5Thon && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoDropdownTop5Thon(false)} />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {danhSachCT.map(ct => (
                      <button
                        key={ct.ma}
                        onClick={() => { setCtTop5Thon(ct.ma); setMoDropdownTop5Thon(false) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${ct.ma === ctTop5Thon ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {ct.ma} — {ct.ten}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between gap-1.5">
            {top5Thon.map((thon) => (
              <div key={thon.ten} className="group flex items-center gap-2 cursor-default transition-all duration-300 ease-out">
                <span className="text-xs text-slate-500 group-hover:text-blue-600 w-24 truncate flex-shrink-0 transition-colors duration-100" title={thon.ten}>{thon.ten}</span>
                <div className="flex-1 relative h-5 bg-slate-100 rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded transition-all duration-500 ease-out group-hover:!bg-[#1c5cab] group-hover:!opacity-100"
                    style={{ width: `${(thon.giaTri / (top5Thon[0]?.giaTri || 1)) * 100}%`, backgroundColor: MAU_THANH, opacity: 0.85 }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 w-12 text-right flex-shrink-0 transition-colors duration-100">{dinhDangSo(thon.giaTri)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Giữa: Tiến độ nộp — Donut chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-col items-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-bold text-slate-700 mb-1">Tiến Độ Nộp</p>
          <div className="relative w-full mb-2">
            <button
              onClick={() => setMoDropdownBC(!moDropdownBC)}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{baoCaoHienTai.ten}</span>
              <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${moDropdownBC ? 'rotate-180' : ''}`} />
            </button>
            {moDropdownBC && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoDropdownBC(false)} />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {danhSachBaoCao.map(bc => {
                    const homNay = new Date().toISOString().slice(0, 10)
                    const conHan = bc.ngayHetHan >= homNay
                    return (
                      <button
                        key={bc.id}
                        onClick={() => { setBaoCaoChon(bc.id); setMoDropdownBC(false) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2 ${bc.id === baoCaoChon ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="truncate">{bc.ten}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${conHan ? 'bg-green-500' : 'bg-red-500'}`} />
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie
                  data={duLieuDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  dataKey="giaTri"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  paddingAngle={2}
                >
                  {duLieuDonut.map((_, i) => (
                    <Cell key={i} fill={MAU_DONUT[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} thôn`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-800">{phanTramNop}%</span>
              <span className="text-[10px] text-slate-400">đã nộp</span>
            </div>
          </div>

          <div className="mt-1 w-full space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MAU_DONUT[0] }} />
                <span className="text-slate-500">Đã nộp</span>
              </div>
              <span className="font-bold text-slate-700">{baoCaoHienTai.soThonDaNop}/{baoCaoHienTai.tongSoThon} thôn</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MAU_DONUT[1] }} />
                <span className="text-slate-500">Chưa nộp</span>
              </div>
              <span className="font-bold text-slate-700">{baoCaoHienTai.tongSoThon - baoCaoHienTai.soThonDaNop}/{baoCaoHienTai.tongSoThon} thôn</span>
            </div>
          </div>
        </div>

        {/* Phải: khung trống */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 min-h-[220px] flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
        </div>
      </div>
    </div>
  )
}
