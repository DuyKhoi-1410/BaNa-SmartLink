import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, ClipboardList, CalendarDays, Clock, AlertTriangle, CheckCircle2, XCircle, Users } from 'lucide-react'
import { danhSachTab } from './nhiem-vu/constants'
import { tinhTrangThai, dinhDangNgay } from './nhiem-vu/utils'
import { useNhiemVu } from '../../context/NhiemVuContext'
import ChiTietBaoCao from './nhiem-vu/ChiTietBaoCao'
import FormTaoBaoCao from './nhiem-vu/FormTaoBaoCao'

export default function NhiemVuBaoCao() {
  const location = useLocation()
  const { danhSachNhiemVu, themNhiemVu, layTienDoThon } = useNhiemVu()
  const [tabHienTai, setTabHienTai] = useState('tat-ca')
  const tabContainerRef = useRef(null)
  const [sliderStyle, setSliderStyle] = useState({})
  const [hienPopup, setHienPopup] = useState(false)
  const [baoCaoChon, setBaoCaoChon] = useState(null)

  const danhSach = danhSachNhiemVu

  useEffect(() => {
    const baoCaoIdTuThongBao = location.state?.baoCaoId
    if (baoCaoIdTuThongBao) {
      const timThay = danhSach.find(bc => bc.id === baoCaoIdTuThongBao)
      if (timThay) {
        moChiTiet(timThay)
        return
      }
    }
    setBaoCaoChon(null)
  }, [location.key])

  const danhSachThon = baoCaoChon ? layTienDoThon(baoCaoChon.id) : []

  const moChiTiet = (baoCao) => {
    setBaoCaoChon(baoCao)
  }

  const quayLaiDanhSach = () => {
    setBaoCaoChon(null)
  }

  const themBaoCao = (baoCaoMoi) => {
    themNhiemVu(baoCaoMoi)
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

  if (baoCaoChon) {
    return (
      <ChiTietBaoCao
        baoCao={baoCaoChon}
        danhSachThon={danhSachThon}
        quayLai={quayLaiDanhSach}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Nhiệm Vụ</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Quản lý các đợt kê khai và báo cáo từ 10 thôn</p>
        </div>
        <button
          onClick={() => setHienPopup(true)}
          className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/25 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm text-sm"
        >
          <Plus size={18} />
          Tạo Báo Cáo
        </button>
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
            const phanTram = Math.round((nv.soThonDaNop / nv.tongSoThon) * 100)

            const mauVien = trangThai.loaiTrangThai === 'het-han'
              ? 'border-l-red-500'
              : trangThai.loaiTrangThai === 'sap-het-han'
                ? 'border-l-blue-500'
                : 'border-l-emerald-500'

            const mauThanhTienDo = phanTram === 100
              ? 'from-emerald-400 to-emerald-600'
              : phanTram >= 50
                ? 'from-blue-400 to-blue-600'
                : 'from-indigo-400 to-indigo-600'

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

                    <div className="sm:ml-auto w-full sm:w-72">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm md:text-base font-bold text-slate-700 flex items-center gap-1.5">
                          <Users size={16} className={phanTram === 100 ? 'text-emerald-500' : 'text-blue-500'} />
                          <span className={phanTram === 100 ? 'text-emerald-600' : phanTram >= 50 ? 'text-blue-600' : 'text-indigo-600'}>{nv.soThonDaNop}</span>
                          <span className="text-slate-400">/</span>
                          <span>{nv.tongSoThon} thôn</span>
                        </span>
                        <span className={`text-lg md:text-xl font-extrabold ${phanTram === 100 ? 'text-emerald-600' : phanTram >= 50 ? 'text-blue-600' : 'text-indigo-600'}`}>{phanTram}%</span>
                      </div>
                      <div className="h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${mauThanhTienDo} transition-all duration-700 ease-out`}
                          style={{ width: `${phanTram}%` }}
                        />
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
          <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
            Tạo đợt báo cáo đầu tiên để bắt đầu thu thập dữ liệu từ 10 thôn
          </p>
          <button
            onClick={() => setHienPopup(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/25 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-[0.98] active:shadow-sm"
          >
            <Plus size={18} />
            Tạo báo cáo đầu tiên
          </button>
        </div>
      )}

      <FormTaoBaoCao
        hienPopup={hienPopup}
        dongPopup={() => setHienPopup(false)}
        themBaoCao={themBaoCao}
      />
    </div>
  )
}
