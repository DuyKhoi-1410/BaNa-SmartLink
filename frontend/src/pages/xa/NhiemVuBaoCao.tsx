import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, ClipboardList, CalendarDays, Clock, AlertTriangle, CheckCircle2, XCircle, Users, Loader2 } from 'lucide-react'
import { danhSachTab } from './nhiem-vu/constants'
import { tinhTrangThai, dinhDangNgay } from './nhiem-vu/utils'
import { api } from '../../lib/api'
import ChiTietBaoCao from './nhiem-vu/ChiTietBaoCao'
import FormTaoBaoCao from './nhiem-vu/FormTaoBaoCao'
import Toast from '../../components/Toast'

const tatCaChiTieu = ['CT01','CT02','CT03','CT04','CT05','CT06','CT07','CT08','CT09','CT10','CT11','CT12','CT13','CT14']

export default function NhiemVuBaoCao() {
  const location = useLocation()
  const [tabHienTai, setTabHienTai] = useState('tat-ca')
  const tabContainerRef = useRef(null)
  const [sliderStyle, setSliderStyle] = useState<any>({})
  const [hienPopup, setHienPopup] = useState(false)
  const [baoCaoChon, setBaoCaoChon] = useState(null)
  const [danhSach, setDanhSach] = useState([])
  const [dangTai, setDangTai] = useState(true)
  const [danhSachThon, setDanhSachThon] = useState([])
  const [hienToast, setHienToast] = useState(false)

  const taiDanhSach = useCallback(async () => {
    try {
      const periods = await api.get('/periods')
      const nhiemVuList = await Promise.all(
        periods.map(async (dot) => {
          let tienDoAll = []
          let villageDecls = []
          try {
            [tienDoAll, villageDecls] = await Promise.all([
              api.get(`/reports/tien-do/${dot.id}`),
              api.get(`/village-declarations?dot_id=${dot.id}`),
            ])
          } catch {}
          const tongSoThon = tienDoAll.length || 10
          const soThonDaNop = villageDecls.filter(v => v.trang_thai === 'da_nop_xa').length
          return {
            id: dot.id,
            ten: dot.ten_dot,
            loai: dot.loai === 'dinh_ky' ? 'dinh-ky' : 'dot-xuat',
            ngayBatDau: dot.ngay_bat_dau,
            ngayHetHan: dot.ngay_ket_thuc,
            chiTieu: dot.chi_tieu || tatCaChiTieu,
            soThonDaNop,
            tongSoThon,
          }
        })
      )
      setDanhSach(nhiemVuList)
      return nhiemVuList
    } catch (err) {
      console.error('Loi tai nhiem vu xa:', err)
      return []
    } finally {
      setDangTai(false)
    }
  }, [])

  useEffect(() => {
    taiDanhSach().then((list) => {
      const baoCaoIdTuThongBao = location.state?.baoCaoId
      if (baoCaoIdTuThongBao) {
        const timThay = list.find(bc => bc.id === baoCaoIdTuThongBao)
        if (timThay) {
          moChiTiet(timThay)
          window.history.replaceState({}, '')
        }
      }
    })
  }, [])

  const taiTienDoThon = useCallback(async (dotId) => {
    try {
      const [tongHopXa, dsThon, villageDecls] = await Promise.all([
        api.get(`/reports/tong-hop/${dotId}`),
        api.get('/reports/thon'),
        api.get(`/village-declarations?dot_id=${dotId}`),
      ])

      const fieldMap = {
        CT01: 'ct01_tong_ho', CT02: 'ct02_tong_nhan_khau', CT03: 'ct03_ho_ngheo',
        CT04: 'ct04_ho_can_ngheo', CT05: 'ct05_nguoi_co_cong', CT06: 'ct06_bao_tro_xh',
        CT07: 'ct07_tre_duoi_16', CT08: 'ct08_tre_hoan_canh', CT09: 'ct09_gia_dinh_van_hoa',
        CT10: 'ct10_tuoi_lao_dong', CT11: 'ct11_tham_gia_bhyt',
        CT12: 'ct12_thanh_vien_to_cnsc', CT13: 'ct13_huong_dan_dvc', CT14: 'ct14_bao_luc_gia_dinh',
      }

      return dsThon.map(thon => {
        const tongHop = tongHopXa.find(t => t.thon_id === thon.id)
        const vDecl = villageDecls.find(v => v.thon_id === thon.id)
        const daNop = vDecl?.trang_thai === 'da_nop_xa'
        const duLieuCT = {}
        if (tongHop) {
          Object.entries(fieldMap).forEach(([ct, field]) => {
            duLieuCT[ct] = parseInt(tongHop[field]) || 0
          })
        }
        return {
          ten: thon.ten_thon,
          daNop,
          ngayNop: daNop && vDecl?.updated_at ? vDecl.updated_at : null,
          duLieuCT: daNop ? duLieuCT : { CT01: duLieuCT['CT01'] ?? 0 },
        }
      })
    } catch (err) {
      console.error('Loi tai tien do thon:', err)
      return []
    }
  }, [])

  const moChiTiet = async (baoCao) => {
    setBaoCaoChon(baoCao)
    const thonData = await taiTienDoThon(baoCao.id)
    setDanhSachThon(thonData)
  }

  const quayLaiDanhSach = () => {
    setBaoCaoChon(null)
    setDanhSachThon([])
    taiDanhSach()
  }

  const themBaoCao = async (baoCaoMoi) => {
    const dotMoi = await api.post('/periods', {
      ten_dot: baoCaoMoi.ten,
      loai: 'dot_xuat',
      nam: new Date().getFullYear(),
      ngay_bat_dau: baoCaoMoi.ngayBatDau,
      ngay_ket_thuc: baoCaoMoi.ngayHetHan,
      mo_ta: baoCaoMoi.chiTiet || '',
      chi_tieu: baoCaoMoi.chiTieu,
    })
    if (baoCaoMoi.dinhKem?.length > 0 && dotMoi?.id) {
      await Promise.all(baoCaoMoi.dinhKem.map(item => {
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('mo_ta', item.moTa || '')
        return api.upload(`/attachments/${dotMoi.id}`, formData)
      }))
    }
    await taiDanhSach()
    setHienToast(true)
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

  if (dangTai) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
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

      <Toast
        hien={hienToast}
        noiDung="Tạo báo cáo thành công!"
        dongToast={() => setHienToast(false)}
      />
    </div>
  )
}
