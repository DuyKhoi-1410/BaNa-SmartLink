import { useState, useEffect, useMemo } from 'react'
import { CalendarDays, Home, Users, Clock, FileText, ChevronDown, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { tinhTrangThai } from './nhiem-vu/utils'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import anhNen from '../../assets/cauvang1k.jpg'

const danhSachAnh = [anhNen]
const THOI_GIAN_CHUYEN = 5000

const thuTrongTuan = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const thangTrongNam = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const danhSachCT = [
  { ma: 'CT01', ten: 'Tổng số hộ dân' },
  { ma: 'CT02', ten: 'Tổng số nhân khẩu' },
  { ma: 'CT03', ten: 'Số hộ nghèo' },
  { ma: 'CT04', ten: 'Số hộ cận nghèo' },
  { ma: 'CT05', ten: 'Người có công với CM' },
  { ma: 'CT06', ten: 'Đối tượng bảo trợ XH' },
  { ma: 'CT07', ten: 'Trẻ em dưới 16 tuổi' },
  { ma: 'CT08', ten: 'Trẻ em hoàn cảnh ĐB' },
  { ma: 'CT09', ten: 'Hộ "Gia đình văn hóa"' },
  { ma: 'CT10', ten: 'Người trong tuổi LĐ' },
  { ma: 'CT11', ten: 'Người tham gia BHYT' },
  { ma: 'CT12', ten: 'Thành viên Tổ CNSCĐ' },
  { ma: 'CT13', ten: 'Hướng dẫn DVC trực tuyến' },
  { ma: 'CT14', ten: 'Vụ bạo lực gia đình' },
]

// duLieuBieuDo is computed inside the component using API data

const MAU_THANH = '#2a78d6'
const MAU_DONUT = ['#10b981', '#f59e0b', '#e34948']
function mauTheoMucDo(phanTram) {
  if (phanTram >= 50) return { thanh: '#ef4444', hover: '#dc2626', chu: 'text-red-600' }
  if (phanTram >= 20) return { thanh: '#f59e0b', hover: '#d97706', chu: 'text-amber-600' }
  return { thanh: '#10b981', hover: '#059669', chu: 'text-emerald-600' }
}

function layNgayHienTai() {
  const now = new Date()
  return `${thuTrongTuan[now.getDay()]}, ${now.getDate()} Tháng ${thangTrongNam[now.getMonth()]}, ${now.getFullYear()}`
}

function dinhDangSo(so) {
  if (so === null || so === undefined) return '—'
  return so.toLocaleString('vi-VN')
}

export default function TrangChuThon() {
  const { nguoiDung } = useAuth()
  const [anhHienTai, setAnhHienTai] = useState(0)
  const [moDropdownChoDuyet, setMoDropdownChoDuyet] = useState(false)
  const [thanhHover, setThanhHover] = useState(null)
  const [nhiemVuDonutChon, setNhiemVuDonutChon] = useState(null)
  const [moDropdownDonut, setMoDropdownDonut] = useState(false)
  const [nvThayDoiChon, setNvThayDoiChon] = useState(null)
  const [moDropdownThayDoi, setMoDropdownThayDoi] = useState(false)
  const [dangTai, setDangTai] = useState(true)

  const [danhSachNhiemVu, setDanhSachNhiemVu] = useState([])
  const [duLieuThon, setDuLieuThon] = useState<any>({})
  const [tienDoNhiemVu, setTienDoNhiemVu] = useState([])

  const thonId = nguoiDung?.thon_id
  const tenThon = nguoiDung?.ten_thon || 'Thôn'

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const periods = await api.get('/periods')

        const tienDoPromises = thonId
          ? periods.map(dot => api.get(`/reports/tien-do/${dot.id}?thon_id=${thonId}`).catch(() => ({ tong_ho: 0, da_ke_khai: 0, da_duyet: 0, tra_lai: 0 })))
          : periods.map(() => Promise.resolve({ tong_ho: 0, da_ke_khai: 0, da_duyet: 0, tra_lai: 0 }))

        const tongHopPromise = thonId
          ? api.get('/reports/tong-hop-moi-nhat').catch(() => [])
          : Promise.resolve([])

        const [tienDoResults, tongHopAll] = await Promise.all([
          Promise.all(tienDoPromises),
          tongHopPromise,
        ])
        const tongHop = Array.isArray(tongHopAll)
          ? tongHopAll.find(t => t.thon_id === thonId) || null
          : null

        const nhiemVuList = []
        const tienDoList = []
        periods.forEach((dot, i) => {
          const tienDo = tienDoResults[i]
          const tongHo = parseInt(tienDo.tong_ho) || 0
          const daKeKhai = parseInt(tienDo.da_ke_khai) || 0
          const daDuyet = parseInt(tienDo.da_duyet) || 0
          const traLai = parseInt(tienDo.tra_lai) || 0
          const choDuyet = Math.max(0, daKeKhai - daDuyet - traLai)
          const chuaNop = Math.max(0, tongHo - daKeKhai)

          nhiemVuList.push({ id: dot.id, ten: dot.ten_dot, ngayHetHan: dot.ngay_ket_thuc })
          tienDoList.push({
            id: dot.id, ten: dot.ten_dot, ngayHetHan: dot.ngay_ket_thuc,
            trangThai: tinhTrangThai(dot.ngay_ket_thuc),
            tongHo, daDuyet, choDuyet, chuaNop,
          })
        })

        setDanhSachNhiemVu(nhiemVuList)
        setTienDoNhiemVu(tienDoList)

        if (tongHop) {
          const dl = {}
          const fieldMap = {
            ct01_tong_ho: 'CT01', ct02_tong_nhan_khau: 'CT02', ct03_ho_ngheo: 'CT03',
            ct04_ho_can_ngheo: 'CT04', ct05_nguoi_co_cong: 'CT05', ct06_bao_tro_xh: 'CT06',
            ct07_tre_duoi_16: 'CT07', ct08_tre_hoan_canh: 'CT08',
            ct09_gia_dinh_van_hoa: 'CT09', ct10_tuoi_lao_dong: 'CT10',
            ct11_tham_gia_bhyt: 'CT11', ct12_thanh_vien_to_cnsc: 'CT12',
            ct13_huong_dan_dvc: 'CT13', ct14_bao_luc_gia_dinh: 'CT14',
          }
          Object.entries(fieldMap).forEach(([key, ct]) => {
            dl[ct] = parseInt(tongHop[key]) || 0
          })
          setDuLieuThon(dl)
        }
      } catch (err) {
        console.error('Loi tai trang chu thon:', err)
      } finally {
        setDangTai(false)
      }
    }
    taiDuLieu()
  }, [thonId])

  const homNay = new Date().toISOString().slice(0, 10)
  const soNhiemVuHoatDong = danhSachNhiemVu.filter(nv => nv.ngayHetHan >= homNay).length

  const chiTietChoDuyet = useMemo(() => {
    return tienDoNhiemVu
      .filter(nv => nv.ngayHetHan >= homNay && nv.choDuyet > 0)
      .map(nv => ({ ten: nv.ten, choDuyet: nv.choDuyet }))
  }, [tienDoNhiemVu])

  const tongChoDuyet = chiTietChoDuyet.reduce((sum, item) => sum + item.choDuyet, 0)

  const nvDonutId = nhiemVuDonutChon ?? danhSachNhiemVu[0]?.id
  const donutData = useMemo(() => {
    const nv = tienDoNhiemVu.find(n => n.id === nvDonutId)
    if (!nv) return null
    return nv
  }, [nvDonutId, tienDoNhiemVu])

  const duLieuDonut = donutData ? [
    { ten: 'Đã duyệt', giaTri: donutData.daDuyet },
    { ten: 'Chờ duyệt', giaTri: donutData.choDuyet },
    { ten: 'Chưa nộp', giaTri: donutData.chuaNop },
  ] : []

  const phanTramDaDuyet = donutData && donutData.tongHo > 0
    ? Math.round((donutData.daDuyet / donutData.tongHo) * 100)
    : 0

  const nvDonutHienTai = danhSachNhiemVu.find(nv => nv.id === nvDonutId)

  const nvThayDoiId = nvThayDoiChon ?? danhSachNhiemVu[0]?.id
  const [thayDoiHover, setThayDoiHover] = useState(null)
  const duLieuThayDoiCT = useMemo(() => {
    if (!nvThayDoiId) return []
    return danhSachCT.map((ct, i) => {
      const seed = ((nvThayDoiId * 7 + i * 13 + 37) % 97)
      const phanTram = ct.ma === 'CT01' ? 0 : Math.round(seed * 65 / 97)
      return { ma: ct.ma, ten: ct.ten, phanTram }
    })
  }, [nvThayDoiId])
  const nvThayDoiHienTai = danhSachNhiemVu.find(nv => nv.id === nvThayDoiId)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnhHienTai((prev) => (prev + 1) % danhSachAnh.length)
    }, THOI_GIAN_CHUYEN)
    return () => clearInterval(timer)
  }, [])

  const duLieuBieuDo = danhSachCT.map(ct => ({
    ma: ct.ma,
    ten: ct.ten,
    giaTri: duLieuThon[ct.ma] ?? 0,
  }))

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
            <p className="text-white text-lg font-semibold">{nguoiDung?.ho_ten || `Cán bộ ${tenThon}`}</p>
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

      {/* ── Hàng KPI — 4 thẻ pastel ── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:mt-8 md:gap-4">
        {/* Tổng số hộ dân */}
        <div className="bg-rose-50 rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <Home size={28} className="text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">{dinhDangSo(duLieuThon.CT01 ?? 0)}</span>
            <span className="text-base text-slate-500 leading-tight">Tổng số hộ dân</span>
          </div>
        </div>

        {/* Tổng số nhân khẩu */}
        <div className="bg-emerald-50 rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <Users size={28} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">{dinhDangSo(duLieuThon.CT02 ?? 0)}</span>
            <span className="text-base text-slate-500 leading-tight">Tổng số nhân khẩu</span>
          </div>
        </div>

        {/* Chờ duyệt — có dropdown */}
        <div className="relative bg-orange-50 rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <Clock size={28} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-slate-800">{tongChoDuyet}</span>
              <button
                onClick={() => setMoDropdownChoDuyet(!moDropdownChoDuyet)}
                className="p-0.5 rounded hover:bg-orange-100 transition-colors"
              >
                <ChevronDown size={18} className={`text-slate-500 transition-transform duration-200 ${moDropdownChoDuyet ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <span className="text-base text-slate-500 leading-tight">Chờ duyệt</span>
          </div>

          {moDropdownChoDuyet && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMoDropdownChoDuyet(false)} />
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {chiTietChoDuyet.length > 0 ? chiTietChoDuyet.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600 truncate mr-2">{item.ten}</span>
                    <span className="font-bold text-orange-600 flex-shrink-0">{item.choDuyet} hộ</span>
                  </div>
                )) : (
                  <div className="px-4 py-3 text-xs text-slate-400 text-center">Không có hộ nào chờ duyệt</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Nhiệm vụ đang hoạt động */}
        <div className="bg-amber-50 rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <FileText size={28} className="text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">{soNhiemVuHoatDong}</span>
            <span className="text-base text-slate-500 leading-tight">Nhiệm vụ đang hoạt động</span>
          </div>
        </div>
      </div>

      {/* ── Hàng giữa — Biểu đồ thanh ngang (trái) + Biểu đồ cột theo hộ dân (phải) ── */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 md:mt-5 md:gap-5">
        {/* Trái: Biểu đồ thanh ngang CT01-CT14 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-bold text-slate-700 mb-4">Tổng Hợp Chỉ Tiêu Thôn</p>
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
                            className="absolute inset-y-0 left-0 rounded transition-all duration-500 ease-out"
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

        {/* Phải: Tỉ lệ thay đổi theo CT */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between gap-2 mb-4">
            <p className="text-sm font-bold text-slate-700">Tỉ Lệ Thay Đổi Theo Chỉ Tiêu</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-shrink-0">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{'<'}20%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />20-49%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />≥50%</span>
            </div>
          </div>

          <div className="relative mb-3">
            <button
              onClick={() => setMoDropdownThayDoi(!moDropdownThayDoi)}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{nvThayDoiHienTai?.ten || 'Chọn nhiệm vụ'}</span>
              <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${moDropdownThayDoi ? 'rotate-180' : ''}`} />
            </button>
            {moDropdownThayDoi && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoDropdownThayDoi(false)} />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {danhSachNhiemVu.map(nv => {
                    const trangThai = tinhTrangThai(nv.ngayHetHan)
                    return (
                      <button
                        key={nv.id}
                        onClick={() => { setNvThayDoiChon(nv.id); setMoDropdownThayDoi(false) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2 ${nv.id === nvThayDoiId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="truncate">{nv.ten}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trangThai.loaiTrangThai === 'het-han' ? 'bg-red-500' : 'bg-green-500'}`} />
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="max-h-[270px] overflow-y-auto pr-1 space-y-2.5">
            {duLieuThayDoiCT.map((ct, index) => {
              const mau = mauTheoMucDo(ct.phanTram)
              const dangHover = thayDoiHover === index
              return (
                <div
                  key={ct.ma}
                  className="cursor-default"
                  onMouseEnter={() => setThayDoiHover(index)}
                  onMouseLeave={() => setThayDoiHover(null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[48px] flex-shrink-0 text-right">
                      <span className={`text-xs font-bold transition-colors duration-100 ${dangHover ? mau.chu : 'text-slate-500'}`}>
                        {ct.ma}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 relative h-5 bg-slate-100 rounded overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded transition-all duration-500 ease-out"
                          style={{
                            width: `${ct.phanTram * 0.8}%`,
                            backgroundColor: dangHover ? mau.hover : mau.thanh,
                            opacity: dangHover ? 1 : 0.85,
                          }}
                        />
                      </div>
                      <span className={`text-xs font-bold flex-shrink-0 w-[36px] text-right transition-colors duration-100 ${dangHover ? mau.chu : 'text-slate-700'}`}>
                        {ct.phanTram}%
                      </span>
                    </div>
                  </div>
                  <p className={`ml-[60px] text-[10px] mt-0.5 transition-colors duration-100 ${dangHover ? mau.chu : 'text-slate-400'}`}>
                    {ct.ten}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Hàng cuối — 3 khung nhỏ ── */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 md:mt-5 md:gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4 min-h-[220px] flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-bold text-slate-700 mb-3">Tình Hình Thôn</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-col items-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-bold text-slate-700 mb-1">Tiến Độ Duyệt Kê Khai</p>
          <div className="relative w-full mb-2">
            <button
              onClick={() => setMoDropdownDonut(!moDropdownDonut)}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="truncate">{nvDonutHienTai?.ten || 'Chọn nhiệm vụ'}</span>
              <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${moDropdownDonut ? 'rotate-180' : ''}`} />
            </button>
            {moDropdownDonut && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoDropdownDonut(false)} />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {danhSachNhiemVu.map(nv => {
                    const trangThai = tinhTrangThai(nv.ngayHetHan)
                    return (
                      <button
                        key={nv.id}
                        onClick={() => { setNhiemVuDonutChon(nv.id); setMoDropdownDonut(false) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2 ${nv.id === nvDonutId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="truncate">{nv.ten}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trangThai.loaiTrangThai === 'het-han' ? 'bg-red-500' : 'bg-green-500'}`} />
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {donutData && (
            <>
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
                      formatter={(value, name) => [`${value} hộ`, name]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-800">{phanTramDaDuyet}%</span>
                  <span className="text-[10px] text-slate-400">đã duyệt</span>
                </div>
              </div>

              <div className="mt-1 w-full space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MAU_DONUT[0] }} />
                    <span className="text-slate-500">Đã duyệt</span>
                  </div>
                  <span className="font-bold text-slate-700">{donutData.daDuyet}/{donutData.tongHo} hộ</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MAU_DONUT[1] }} />
                    <span className="text-slate-500">Chờ duyệt</span>
                  </div>
                  <span className="font-bold text-slate-700">{donutData.choDuyet}/{donutData.tongHo} hộ</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MAU_DONUT[2] }} />
                    <span className="text-slate-500">Chưa nộp</span>
                  </div>
                  <span className="font-bold text-slate-700">{donutData.chuaNop}/{donutData.tongHo} hộ</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 min-h-[220px] flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-bold text-slate-700 mb-3">Top 5 Chỉ Tiêu Cao Nhất</p>
        </div>
      </div>
    </div>
  )
}
