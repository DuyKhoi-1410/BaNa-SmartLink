import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { ClipboardList, CalendarDays, Clock, AlertTriangle, CheckCircle2, XCircle, Users, Loader2 } from 'lucide-react'
import { danhSachTab } from './nhiem-vu/constants'
import { tinhTrangThai, dinhDangNgay, tinhThongKeHo } from './nhiem-vu/utils'
import { useNhiemVu } from '../../context/NhiemVuContext'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import ChiTietNhiemVuThon from './nhiem-vu/ChiTietNhiemVuThon'

function chuyenDoiKeKhai(kk) {
  const mapTrangThai = {
    da_ke_khai: 'cho-duyet',
    da_duyet: 'da-duyet',
    tra_lai: 'tu-choi',
    giu_nguyen: 'da-duyet',
    chua_ke_khai: null,
  }
  const trangThaiDuyet = mapTrangThai[kk.trang_thai] || null
  const daNop = kk.trang_thai !== 'chua_ke_khai'

  const duLieuCT = {}
  if (daNop) {
    duLieuCT.CT02 = Number(kk.ct02_tong_nhan_khau) || 0
    duLieuCT.CT03 = Number(kk.ct03_ho_ngheo) || 0
    duLieuCT.CT04 = Number(kk.ct04_ho_can_ngheo) || 0
    duLieuCT.CT05 = Number(kk.ct05_nguoi_co_cong) || 0
    duLieuCT.CT06 = Number(kk.ct06_bao_tro_xh) || 0
    duLieuCT.CT07 = Number(kk.ct07_tre_duoi_16) || 0
    duLieuCT.CT08 = Number(kk.ct08_tre_hoan_canh) || 0
    duLieuCT.CT10 = Number(kk.ct10_tuoi_lao_dong) || 0
    duLieuCT.CT11 = Number(kk.ct11_tham_gia_bhyt) || 0
    duLieuCT.CT01 = 1
  }

  return {
    id: kk.id,
    hoDanId: kk.ho_dan_id,
    ten: kk.ho_ten_chu_ho ? `Hộ ${kk.ho_ten_chu_ho}` : `Hộ #${kk.ho_dan_id}`,
    daNop,
    ngayNop: kk.ngay_ke_khai?.slice(0, 10) || '',
    duLieuCT,
    trangThaiDuyet,
    lyDoTuChoi: kk.ly_do_tra_lai || '',
  }
}

export default function NhiemVuThon() {
  const { layNhiemVuChoThon } = useNhiemVu()
  const { nguoiDung } = useAuth()
  const location = useLocation()
  const [tabHienTai, setTabHienTai] = useState('tat-ca')
  const tabContainerRef = useRef(null)
  const [sliderStyle, setSliderStyle] = useState({})
  const [nhiemVuChon, setNhiemVuChon] = useState(null)
  const [dangTaiHo, setDangTaiHo] = useState(false)

  const danhSach = layNhiemVuChoThon()

  useEffect(() => {
    const nhiemVuId = location.state?.nhiemVuId
    if (nhiemVuId != null) {
      const nv = danhSach.find(n => n.id === nhiemVuId)
      if (nv) setNhiemVuChon(nv)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const [hoTheoNhiemVu, setHoTheoNhiemVu] = useState({})

  const taiDuLieuHo = useCallback(async (dotId) => {
    if (!nguoiDung?.thon_id) return
    try {
      setDangTaiHo(true)
      const [declarations, households] = await Promise.all([
        api.get(`/declarations?dot_id=${dotId}&thon_id=${nguoiDung.thon_id}`),
        api.get(`/households?thon_id=${nguoiDung.thon_id}&trang_thai=dang_cu_tru`),
      ])
      const dsKeKhai = declarations.map(chuyenDoiKeKhai)
      const hoDanIdDaKeKhai = new Set(dsKeKhai.map(k => k.hoDanId))
      const hoChuaKeKhai = households
        .filter(h => !hoDanIdDaKeKhai.has(h.id))
        .map(h => ({
          id: null,
          hoDanId: h.id,
          ten: `Hộ ${h.ho_ten_chu_ho}`,
          daNop: false,
          ngayNop: '',
          duLieuCT: {},
          trangThaiDuyet: null,
          lyDoTuChoi: '',
        }))
      setHoTheoNhiemVu(prev => ({ ...prev, [dotId]: [...dsKeKhai, ...hoChuaKeKhai] }))
    } catch (err) {
      console.error('Loi tai du lieu ho dan:', err)
    } finally {
      setDangTaiHo(false)
    }
  }, [nguoiDung?.thon_id])

  useEffect(() => {
    danhSach.forEach(nv => {
      if (!hoTheoNhiemVu[nv.id]) {
        taiDuLieuHo(nv.id)
      }
    })
  }, [danhSach])

  const thongKeTheoNhiemVu = useMemo(() => {
    const map = {}
    Object.entries(hoTheoNhiemVu).forEach(([id, ds]) => {
      const nv = danhSach.find(n => String(n.id) === String(id))
      map[id] = tinhThongKeHo(ds, nv?.tongSoHo)
    })
    return map
  }, [hoTheoNhiemVu, danhSach])

  const danhSachHo = nhiemVuChon ? (hoTheoNhiemVu[nhiemVuChon.id] || []) : []

  const capNhatDanhSachHo = (updater) => {
    if (!nhiemVuChon) return
    setHoTheoNhiemVu(prev => ({
      ...prev,
      [nhiemVuChon.id]: typeof updater === 'function' ? updater(prev[nhiemVuChon.id]) : updater,
    }))
  }

  const moChiTiet = (nhiemVu) => {
    setNhiemVuChon(nhiemVu)
  }

  const quayLaiDanhSach = () => {
    setNhiemVuChon(null)
  }

  useEffect(() => {
    const container = tabContainerRef.current
    if (!container) return
    const activeBtn = container.querySelector(`[data-tab="${tabHienTai}"]`)
    if (!activeBtn) return
    setSliderStyle({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
    })
  }, [tabHienTai])

  const soLuongTab = useMemo(() => {
    let dangDienRa = 0, daHetHan = 0
    danhSach.forEach((nv) => {
      if (tinhTrangThai(nv.ngayHetHan).loaiTrangThai === 'het-han') daHetHan++
      else dangDienRa++
    })
    return { 'tat-ca': danhSach.length, 'dang-dien-ra': dangDienRa, 'da-het-han': daHetHan }
  }, [danhSach])

  const danhSachLoc = useMemo(() => {
    return danhSach.filter((nv) => {
      if (tabHienTai === 'tat-ca') return true
      const trangThai = tinhTrangThai(nv.ngayHetHan)
      if (tabHienTai === 'dang-dien-ra') return trangThai.loaiTrangThai !== 'het-han'
      if (tabHienTai === 'da-het-han') return trangThai.loaiTrangThai === 'het-han'
      return true
    })
  }, [danhSach, tabHienTai])

  if (nhiemVuChon) {
    return (
      <ChiTietNhiemVuThon
        nhiemVu={nhiemVuChon}
        danhSachHo={danhSachHo}
        capNhatDanhSachHo={capNhatDanhSachHo}
        quayLai={quayLaiDanhSach}
        taiLaiHo={() => taiDuLieuHo(nhiemVuChon.id)}
        thonId={nguoiDung?.thon_id}
        dangTaiHo={dangTaiHo}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Nhiệm Vụ</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Quản lý các đợt kê khai và báo cáo của thôn</p>
        </div>
      </div>

      {/* Tab lọc */}
      <div ref={tabContainerRef} className="relative flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
        <div
          className="absolute top-1 h-[calc(100%-8px)] bg-white rounded-md shadow-sm transition-all duration-300 ease-out"
          style={{ left: sliderStyle.left, width: sliderStyle.width }}
        />
        {danhSachTab.map((tab) => (
          <button
            key={tab.key}
            data-tab={tab.key}
            onClick={() => setTabHienTai(tab.key)}
            className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${tabHienTai === tab.key
                ? 'text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.ten} ({soLuongTab[tab.key]})
          </button>
        ))}
      </div>

      {/* Danh sách nhiệm vụ */}
      {danhSachLoc.length > 0 ? (
        <div className="space-y-4">
          {danhSachLoc.map((nv) => {
            const trangThai = tinhTrangThai(nv.ngayHetHan)
            const tk = thongKeTheoNhiemVu[nv.id] || { tongHo: 0, chuaNop: 0, choDuyet: 0, daDuyet: 0, ptDaDuyet: 0, ptChoDuyet: 0 }
            const { tongHo, daNop: soDaNop, chuaNop: soChuaNop, choDuyet: soChoDuyet, daDuyet: soDaDuyet, ptDaDuyet, ptChoDuyet } = tk

            const mauVien = trangThai.loaiTrangThai === 'het-han'
              ? 'border-l-red-500'
              : trangThai.loaiTrangThai === 'sap-het-han'
                ? 'border-l-blue-500'
                : 'border-l-emerald-500'

            return (
              <div
                key={nv.id}
                onClick={() => moChiTiet(nv)}
                className={`bg-white rounded-xl border border-slate-200 border-l-4 ${mauVien} shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 transition-all duration-300 ease-out cursor-pointer group overflow-hidden`}
              >
                <div className="px-4 md:px-5 py-4">
                  {/* Hàng trên: tiêu đề + trạng thái */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-slate-800 group-hover:text-blue-700 transition-colors mb-1.5">{nv.ten}</h3>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${nv.loai === 'dinh-ky' ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                        {nv.loai === 'dinh-ky' ? 'Định kỳ' : 'Đột xuất'}
                      </span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${trangThai.mau}`}>
                        {trangThai.loaiTrangThai === 'het-han' && <XCircle size={13} />}
                        {trangThai.loaiTrangThai === 'dang-dien-ra' && <CheckCircle2 size={13} />}
                        {trangThai.loaiTrangThai === 'sap-het-han' && <AlertTriangle size={13} />}
                        {trangThai.nhan}
                      </span>
                      {trangThai.loaiTrangThai === 'sap-het-han' && (
                        <span className="text-xs text-blue-600 font-medium">
                          Còn {trangThai.soNgayCon} ngày
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hàng dưới: ngày + tiến độ */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-slate-400" />
                        <span>Bắt đầu: {dinhDangNgay(nv.ngayBatDau)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span>Hết hạn: {dinhDangNgay(nv.ngayHetHan)}</span>
                      </div>
                    </div>

                    <div className="sm:ml-auto w-full sm:w-80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <Users size={15} className="text-blue-500" />
                          {soDaNop}/{tongHo} hộ đã nộp
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <span className="text-emerald-700 font-semibold">{soDaDuyet} duyệt</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                            <span className="text-amber-700 font-semibold">{soChoDuyet} chờ</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                            <span className="text-slate-500 font-semibold">{soChuaNop} chưa</span>
                          </span>
                        </div>
                      </div>
                      <div className="h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden flex">
                        {ptDaDuyet > 0 && (
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 ease-out"
                            style={{ width: `${ptDaDuyet}%` }}
                          />
                        )}
                        {ptChoDuyet > 0 && (
                          <div
                            className="h-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-700 ease-out"
                            style={{ width: `${ptChoDuyet}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
            <ClipboardList size={36} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Chưa có nhiệm vụ nào</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            Khi xã tạo đợt kê khai, nhiệm vụ sẽ hiển thị tại đây
          </p>
        </div>
      )}
    </div>
  )
}
