import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Calendar, Clock, CheckCircle2, AlertCircle, Zap, CalendarClock, X, Users, Heart, Shield, Baby, Briefcase, Send, Info, Upload, ImagePlus, Trash2, ArrowLeft, RotateCcw, Pencil, ChevronRight, Loader2, MessageSquare } from 'lucide-react'
import { api } from '../../lib/api'
import Toast from '../../components/Toast'

const tinhSoNgay = (ngayDong: any) => {
  const dong = new Date(ngayDong)
  const chenh = Math.ceil((dong.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  return chenh
}

const formatNgay = (ngay: any) => {
  const d = new Date(ngay)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const DANH_SACH_CT = [
  { ma: 'CT02', ten: 'Tổng số nhân khẩu', moTa: 'Tổng số người đang sống trong hộ (kể cả chủ hộ)', icon: Users, mau: 'blue', loaiNhap: 'so', minhChung: 'Ảnh chụp Sổ hộ khẩu / Thông báo số định danh' },
  { ma: 'CT03', ten: 'Hộ nghèo', moTa: 'Hộ bạn có giấy chứng nhận hộ nghèo do UBND xã cấp không?', icon: Heart, mau: 'rose', loaiNhap: 'co-khong', minhChung: 'Ảnh chụp Giấy chứng nhận hộ nghèo (UBND xã cấp)' },
  { ma: 'CT04', ten: 'Hộ cận nghèo', moTa: 'Hộ bạn có giấy chứng nhận hộ cận nghèo không?', icon: Heart, mau: 'orange', loaiNhap: 'co-khong', minhChung: 'Ảnh chụp Giấy chứng nhận hộ cận nghèo' },
  { ma: 'CT05', ten: 'Người có công với cách mạng', moTa: 'Số thành viên trong hộ có giấy chứng nhận người có công', icon: Shield, mau: 'amber', loaiNhap: 'so', minhChung: 'Ảnh chụp Giấy chứng nhận người có công / Huân, Huy chương' },
  { ma: 'CT06', ten: 'Đối tượng bảo trợ xã hội', moTa: 'Số thành viên đang hưởng trợ cấp bảo trợ xã hội', icon: Shield, mau: 'purple', loaiNhap: 'so', minhChung: 'Ảnh chụp Quyết định hưởng trợ cấp BTXH' },
  { ma: 'CT07', ten: 'Số trẻ em dưới 16 tuổi', moTa: 'Số trẻ em dưới 16 tuổi đang sống trong hộ', icon: Baby, mau: 'cyan', loaiNhap: 'so', minhChung: 'Ảnh chụp Giấy khai sinh / Sổ hộ khẩu có ghi ngày sinh' },
  { ma: 'CT08', ten: 'Trẻ em có hoàn cảnh đặc biệt', moTa: 'Trẻ em mồ côi, khuyết tật, bị bỏ rơi... (không vượt quá số trẻ em)', icon: Baby, mau: 'teal', loaiNhap: 'so', minhChung: 'Ảnh chụp Giấy xác nhận của xã (mồ côi, khuyết tật...)' },
  { ma: 'CT10', ten: 'Người trong độ tuổi lao động', moTa: 'Số thành viên từ 15 đến 60 tuổi (nam) hoặc 15 đến 55 tuổi (nữ)', icon: Briefcase, mau: 'indigo', loaiNhap: 'so', minhChung: 'Ảnh chụp Sổ hộ khẩu / CMND / CCCD có ghi ngày sinh' },
  { ma: 'CT11', ten: 'Số người tham gia BHYT', moTa: 'Số thành viên có thẻ bảo hiểm y tế (không vượt quá tổng nhân khẩu)', icon: Shield, mau: 'emerald', loaiNhap: 'so', minhChung: 'Ảnh chụp Thẻ BHYT từng thành viên' },
]

function ThanhLocTruot({ boLoc, setBoLoc, danhSachTab }) {
  const thanhRef = useRef(null)
  const nutRefs = useRef({})
  const [chiSoTruot, setChiSoTruot] = useState({ left: 0, width: 0 })

  const capNhatViTri = useCallback(() => {
    const nutChon = nutRefs.current[boLoc]
    const thanh = thanhRef.current
    if (!nutChon || !thanh) return
    const thanhRect = thanh.getBoundingClientRect()
    const nutRect = nutChon.getBoundingClientRect()
    setChiSoTruot({
      left: nutRect.left - thanhRect.left,
      width: nutRect.width,
    })
  }, [boLoc])

  useEffect(() => {
    capNhatViTri()
    window.addEventListener('resize', capNhatViTri)
    return () => window.removeEventListener('resize', capNhatViTri)
  }, [capNhatViTri])

  const chonTab = (key) => {
    setBoLoc(key)
    const nut = nutRefs.current[key]
    if (nut) {
      nut.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  return (
    <div
      ref={thanhRef}
      className="relative bg-slate-100 rounded-xl p-1 flex overflow-x-auto scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {chiSoTruot.width > 0 && (
        <div
          className="absolute top-1 bottom-1 bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out pointer-events-none"
          style={{
            width: chiSoTruot.width,
            transform: `translateX(${chiSoTruot.left}px)`,
          }}
        />
      )}
      {danhSachTab.map((tab) => (
        <button
          key={tab.key}
          ref={(el) => { nutRefs.current[tab.key] = el }}
          onClick={() => chonTab(tab.key)}
          className={`relative z-10 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300 flex-shrink-0 whitespace-nowrap
            ${boLoc === tab.key
              ? 'text-slate-800'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          {tab.label} ({tab.soLuong})
        </button>
      ))}
    </div>
  )
}

function mapTrangThaiDot(trangThaiDot, keKhaiCuaToi) {
  if (!keKhaiCuaToi) return 'chua-ke-khai'
  const map = { da_ke_khai: 'cho-duyet', da_duyet: 'da-ke-khai', tra_lai: 'yeu-cau-lai' }
  return map[keKhaiCuaToi.trang_thai] || 'chua-ke-khai'
}

export default function KeKhai() {
  const [danhSachDot, setDanhSachDot] = useState<any[]>([])
  const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true)
  const [hoDanId, setHoDanId] = useState<any>(null)
  const [keKhaiMap, setKeKhaiMap] = useState<any>({})
  const [boLoc, setBoLoc] = useState('tat-ca')
  const [moPopup, setMoPopup] = useState(false)
  const [dotDangChon, setDotDangChon] = useState<any>(null)
  const [duLieuCT, setDuLieuCT] = useState<any>({})
  const [minhChungCT, setMinhChungCT] = useState<any>({})
  const [loiCT, setLoiCT] = useState<any>({})
  const [dangNop, setDangNop] = useState(false)
  const [duLieuDaNop, setDuLieuDaNop] = useState<any>({})
  const [dangXemLai, setDangXemLai] = useState(false)
  const [chiXem, setChiXem] = useState(false)
  const [trangThaiCT, setTrangThaiCT] = useState<any>({})
  const [thongBaoLoi, setThongBaoLoi] = useState<any>(null)
  const [buocHienTai, setBuocHienTai] = useState(0)
  const [daChot, setDaChot] = useState<any>({})
  const [dangChot, setDangChot] = useState<any>({})
  const [duLieuGoc, setDuLieuGoc] = useState<any>({})
  const [moXacNhanNop, setMoXacNhanNop] = useState(false)
  const [hienToast, setHienToast] = useState(false)
  const [dangKeKhaiLai, setDangKeKhaiLai] = useState(false)
  const [danhSachCTCanLai, setDanhSachCTCanLai] = useState<any[]>([])
  const [ghiChu, setGhiChu] = useState('')
  const fileInputRefs = useRef({})
  const navigate = useNavigate()

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const [dotMo, keKhai, hoDan] = await Promise.all([
          api.get('/periods?trang_thai=dang_mo'),
          api.get('/declarations/me'),
          api.get('/households/me'),
        ])

        setHoDanId(hoDan.id)

        const kkMap = {}
        keKhai.forEach(kk => {
          if (!kkMap[kk.dot_id] || kk.phien_ban > kkMap[kk.dot_id].phien_ban) {
            kkMap[kk.dot_id] = kk
          }
        })
        setKeKhaiMap(kkMap)

        const dsDot = dotMo.map(dot => {
          const kk = kkMap[dot.id]
          return {
            id: dot.id,
            tenDot: dot.ten_dot,
            loai: dot.loai === 'dot_xuat' ? 'dot-xuat' : 'dinh-ky',
            ngayMo: dot.ngay_bat_dau,
            ngayDong: dot.ngay_ket_thuc,
            trangThai: mapTrangThaiDot(dot.trang_thai, kk),
            ghiChuChung: kk?.ly_do_tra_lai || '',
            danhSachTraLai: kk?.chi_tieu_tra_lai || [],
            keKhaiId: kk?.id,
            chiTieu: dot.chi_tieu || [],
          }
        })
        setDanhSachDot(dsDot)
      } catch (err) {
        console.error('Loi tai du lieu ke khai:', err)
      } finally {
        setDangTaiDuLieu(false)
      }
    }
    taiDuLieu()
  }, [])

  const chiTieuDot = dotDangChon?.chiTieu || []
  const ctCuaDot = DANH_SACH_CT.filter(ct => chiTieuDot.includes(ct.ma))

  const TAT_CA_BUOC = [
    { tieuDe: 'Nhân khẩu', moTa: 'Tổng số người trong hộ', danhSachMa: ['CT02'] },
    { tieuDe: 'Hộ nghèo', moTa: 'Tình trạng nghèo / cận nghèo', danhSachMa: ['CT03', 'CT04'] },
    { tieuDe: 'Chính sách', moTa: 'Người có công & bảo trợ xã hội', danhSachMa: ['CT05', 'CT06'] },
    { tieuDe: 'Trẻ em', moTa: 'Trẻ em dưới 16 tuổi', danhSachMa: ['CT07', 'CT08'] },
    { tieuDe: 'Lao động & BHYT', moTa: 'Người trong tuổi lao động & bảo hiểm', danhSachMa: ['CT10', 'CT11'] },
  ]
  const DANH_SACH_BUOC = [
    ...TAT_CA_BUOC
      .map(b => ({ ...b, danhSachMa: b.danhSachMa.filter(ma => chiTieuDot.includes(ma)) }))
      .filter(b => b.danhSachMa.length > 0),
    { tieuDe: 'Xem lại & Nộp', moTa: 'Kiểm tra lần cuối trước khi gửi', danhSachMa: [] },
  ]

  const tongSoBuoc = DANH_SACH_BUOC.length
  const laBuocCuoi = buocHienTai === tongSoBuoc - 1


  const chuyenKeKhaiThanhDuLieu = (kk) => {
    if (!kk) return null
    return {
      CT02: kk.ct02_tong_nhan_khau != null ? String(kk.ct02_tong_nhan_khau) : '',
      CT03: kk.ct03_ho_ngheo === 1 ? true : kk.ct03_ho_ngheo === 0 ? false : null,
      CT04: kk.ct04_ho_can_ngheo === 1 ? true : kk.ct04_ho_can_ngheo === 0 ? false : null,
      CT05: kk.ct05_nguoi_co_cong != null ? String(kk.ct05_nguoi_co_cong) : '',
      CT06: kk.ct06_bao_tro_xh != null ? String(kk.ct06_bao_tro_xh) : '',
      CT07: kk.ct07_tre_duoi_16 != null ? String(kk.ct07_tre_duoi_16) : '',
      CT08: kk.ct08_tre_hoan_canh != null ? String(kk.ct08_tre_hoan_canh) : '',
      CT10: kk.ct10_tuoi_lao_dong != null ? String(kk.ct10_tuoi_lao_dong) : '',
      CT11: kk.ct11_tham_gia_bhyt != null ? String(kk.ct11_tham_gia_bhyt) : '',
    }
  }

  const layDuLieuGanNhat = () => {
    const cacDotDaNop = Object.keys(duLieuDaNop)
    if (cacDotDaNop.length > 0) {
      const dotSapXep = cacDotDaNop
        .map(id => danhSachDot.find(d => d.id === Number(id)))
        .filter(Boolean)
        .sort((a: any, b: any) => new Date(b.ngayMo).getTime() - new Date(a.ngayMo).getTime())
      if (dotSapXep.length > 0) return duLieuDaNop[dotSapXep[0].id]
    }
    const cacDotCoKeKhai = Object.entries(keKhaiMap)
      .map(([dotId, kk]: [string, any]) => ({ dotId: Number(dotId), kk }))
      .filter(({ kk }) => kk && kk.trang_thai)
      .sort((a, b) => new Date(b.kk.ngay_ke_khai).getTime() - new Date(a.kk.ngay_ke_khai).getTime())
    if (cacDotCoKeKhai.length === 0) return null
    return chuyenKeKhaiThanhDuLieu(cacDotCoKeKhai[0].kk)
  }

  const moFormKeKhai = (dot) => {
    setDotDangChon(dot)
    const kkTuDB = keKhaiMap[dot.id]
    const duLieuCuaDot = duLieuDaNop[dot.id] || chuyenKeKhaiThanhDuLieu(kkTuDB)

    if (dot.trangThai === 'yeu-cau-lai' && duLieuCuaDot) {
      const duLieuMoi = { ...duLieuCuaDot }
      const dsCTLai = (dot.danhSachTraLai && dot.danhSachTraLai.length > 0)
        ? dot.danhSachTraLai
        : (dot.chiTieu || []).filter(ct => ct !== 'CT01').map(ma => ({ ma, ghiChu: '' }))
      dsCTLai.forEach(item => {
        const ct = DANH_SACH_CT.find(c => c.ma === item.ma)
        if (ct) duLieuMoi[item.ma] = ct.loaiNhap === 'co-khong' ? null : ''
      })
      setDuLieuCT(duLieuMoi)
      setDuLieuGoc({ ...duLieuCuaDot })
      setDangKeKhaiLai(true)
      setDanhSachCTCanLai(dsCTLai)
      setDangXemLai(false)
      setChiXem(false)
      setTrangThaiCT({})
    } else if (duLieuCuaDot) {
      setDuLieuCT({ ...duLieuCuaDot })
      setChiXem(true)
      setDangXemLai(false)
      setDangKeKhaiLai(false)
      setDanhSachCTCanLai([])
      setTrangThaiCT({})
      setDuLieuGoc({})
    } else {
      const duLieuGanNhat = layDuLieuGanNhat()
      if (duLieuGanNhat) {
        setDuLieuCT({ ...duLieuGanNhat })
        setDuLieuGoc({ ...duLieuGanNhat })
        setDangXemLai(true)
        setChiXem(false)
        setDangKeKhaiLai(false)
        setDanhSachCTCanLai([])
        const banDauTT = {}
        const ctMoi = DANH_SACH_CT.filter(ct => (dot.chiTieu || []).includes(ct.ma))
        ctMoi.forEach(ct => { banDauTT[ct.ma] = 'giu' })
        setTrangThaiCT(banDauTT)
      } else {
        const giaTriBanDau = {}
        ctCuaDot.forEach(ct => { giaTriBanDau[ct.ma] = ct.loaiNhap === 'co-khong' ? null : '' })
        setDuLieuCT(giaTriBanDau)
        setDangXemLai(false)
        setChiXem(false)
        setDangKeKhaiLai(false)
        setDanhSachCTCanLai([])
        setTrangThaiCT({})
        setDuLieuGoc({})
      }
    }
    setMinhChungCT({})
    setLoiCT({})
    setBuocHienTai(0)
    setDaChot({})
    setDangChot({})
    setGhiChu('')
    setMoPopup(true)
  }

  const layGoiY = (ma: string) => {
    const ct02Val = parseInt(duLieuCT['CT02'], 10)
    const ct07Val = parseInt(duLieuCT['CT07'], 10)
    const coCT02 = chiTieuDot.includes('CT02') && !isNaN(ct02Val) && ct02Val > 0
    const coCT07 = chiTieuDot.includes('CT07') && !isNaN(ct07Val) && ct07Val > 0

    switch (ma) {
      case 'CT02': return 'Nhập ít nhất 1 (kể cả chủ hộ)'
      case 'CT03': return 'Nếu chọn "Có" thì CT04 (Hộ cận nghèo) phải chọn "Không"'
      case 'CT04': return 'Nếu chọn "Có" thì CT03 (Hộ nghèo) phải chọn "Không"'
      case 'CT05': return coCT02 ? `Không vượt quá ${ct02Val} người (tổng nhân khẩu)` : 'Không vượt quá tổng nhân khẩu (CT02)'
      case 'CT06': return coCT02 ? `Không vượt quá ${ct02Val} người (tổng nhân khẩu)` : 'Không vượt quá tổng nhân khẩu (CT02)'
      case 'CT07': return coCT02 ? `Không vượt quá ${ct02Val} người (tổng nhân khẩu)` : 'Không vượt quá tổng nhân khẩu (CT02)'
      case 'CT08': return coCT07 ? `Không vượt quá ${ct07Val} trẻ (số trẻ em dưới 16 tuổi)` : 'Không vượt quá số trẻ em dưới 16 tuổi (CT07)'
      case 'CT10': return coCT02 ? `Không vượt quá ${ct02Val} người (tổng nhân khẩu)` : 'Không vượt quá tổng nhân khẩu (CT02)'
      case 'CT11': return coCT02 ? `Không vượt quá ${ct02Val} người (tổng nhân khẩu)` : 'Không vượt quá tổng nhân khẩu (CT02)'
      default: return null
    }
  }

  const capNhatGiaTri = (ma: any, giaTri: any) => {
    const ct = DANH_SACH_CT.find(c => c.ma === ma)
    if (ct.loaiNhap === 'co-khong') {
      const duLieuMoi = { ...duLieuCT, [ma]: giaTri }
      setDuLieuCT(duLieuMoi)
      setTimeout(() => tuDongChot(ma, duLieuMoi), 300)
    } else {
      if (giaTri !== '' && !/^\d*$/.test(giaTri)) return
      setDuLieuCT(prev => ({ ...prev, [ma]: giaTri }))
    }
    if (loiCT[ma]) {
      setLoiCT(prev => { const moi = { ...prev }; delete moi[ma]; return moi })
    }
  }

  const xuLyChonFile = (ma: any, files: any) => {
    if (!files || files.length === 0) return
    const danhSachMoi = Array.from(files).map((file: any) => ({
      file,
      ten: file.name,
      url: URL.createObjectURL(file),
    }))
    const minhChungMoi = {
      ...minhChungCT,
      [ma]: [...(minhChungCT[ma] || []), ...danhSachMoi],
    }
    setMinhChungCT(minhChungMoi)
    if (loiCT[`${ma}_mc`]) {
      setLoiCT(prev => { const moi = { ...prev }; delete moi[`${ma}_mc`]; return moi })
    }
    setTimeout(() => tuDongChot(ma, null, minhChungMoi), 300)
  }

  const xoaMinhChung = (ma, index) => {
    setMinhChungCT(prev => {
      const ds = [...(prev[ma] || [])]
      URL.revokeObjectURL(ds[index].url)
      ds.splice(index, 1)
      return { ...prev, [ma]: ds }
    })
  }

  const tuDongChot = (ma: any, duLieuMoi?: any, minhChungMoi?: any) => {
    if (!dangXemLai) return
    const ct = DANH_SACH_CT.find(c => c.ma === ma)
    if (!ct || daChot[ma] || dangChot[ma]) return
    const dl = duLieuMoi || duLieuCT
    const mc = minhChungMoi || minhChungCT
    const val = dl[ma]
    let duDieuKien = false
    if (ct.loaiNhap === 'co-khong') {
      if (val === null || val === undefined) return
      if (val === false) duDieuKien = true
      else duDieuKien = true
    } else {
      if (val === '' || val === undefined) return
      const so = parseInt(val, 10)
      if (isNaN(so) || so < 0) return
      if (ma === 'CT02' && so < 1) return
      duDieuKien = true
    }
    if (duDieuKien && ct.minhChung) {
      const canMC = ct.loaiNhap === 'co-khong' ? val === true : parseInt(val, 10) > 0
      if (canMC && (!mc[ma] || mc[ma].length === 0)) return
    }
    setDangChot(prev => ({ ...prev, [ma]: true }))
    setTimeout(() => {
      setDangChot(prev => { const moi = { ...prev }; delete moi[ma]; return moi })
      setDaChot(prev => ({ ...prev, [ma]: true }))
    }, 600)
  }

  const moLaiChiTieu = (ma) => {
    setDaChot(prev => { const moi = { ...prev }; delete moi[ma]; return moi })
  }

  const kiemTraDuLieu = () => {
    const loi: Record<string, any> = {}
    ctCuaDot.forEach(ct => {
      if (dangXemLai && trangThaiCT[ct.ma] !== 'doi') return
      if (dangKeKhaiLai && !danhSachCTCanLai.find(item => item.ma === ct.ma)) return
      const val = duLieuCT[ct.ma]
      if (ct.loaiNhap === 'co-khong') {
        if (val === null || val === undefined) {
          loi[ct.ma] = 'Vui lòng chọn Có hoặc Không'
        }
      } else {
        if (val === '' || val === undefined) {
          loi[ct.ma] = 'Vui lòng nhập giá trị'
          return
        }
        const so = parseInt(val, 10)
        if (isNaN(so)) { loi[ct.ma] = 'Vui lòng nhập số, không nhập chữ'; return }
        if (so < 0) { loi[ct.ma] = 'Giá trị không được nhỏ hơn 0'; return }
      }
    })

    const so = (ma: any) => {
      const ct = DANH_SACH_CT.find(c => c.ma === ma)
      if (ct && ct.loaiNhap === 'co-khong') return duLieuCT[ma] === true ? 1 : 0
      return parseInt(duLieuCT[ma], 10) || 0
    }

    const coCT = (ma: string) => chiTieuDot.includes(ma)
    if (coCT('CT02') && !loi.CT02 && so('CT02') < 1) loi.CT02 = 'Mỗi hộ phải có ít nhất 1 nhân khẩu (chủ hộ)'
    if (coCT('CT03') && coCT('CT04') && !loi.CT04 && !loi.CT03 && so('CT03') === 1 && so('CT04') === 1) loi.CT04 = 'Hộ không thể vừa nghèo vừa cận nghèo'
    if (coCT('CT05') && coCT('CT02') && !loi.CT05 && !loi.CT02 && so('CT05') > so('CT02')) loi.CT05 = 'Số người có công không thể nhiều hơn tổng nhân khẩu'
    if (coCT('CT06') && coCT('CT02') && !loi.CT06 && !loi.CT02 && so('CT06') > so('CT02')) loi.CT06 = 'Số đối tượng bảo trợ xã hội không thể nhiều hơn tổng nhân khẩu'
    if (coCT('CT07') && coCT('CT02') && !loi.CT07 && !loi.CT02 && so('CT07') > so('CT02')) loi.CT07 = 'Số trẻ em không thể nhiều hơn tổng nhân khẩu'
    if (coCT('CT08') && coCT('CT07') && !loi.CT08 && !loi.CT07 && so('CT08') > so('CT07')) loi.CT08 = 'Trẻ em hoàn cảnh đặc biệt không thể nhiều hơn tổng trẻ em'
    if (coCT('CT10') && coCT('CT02') && !loi.CT10 && !loi.CT02 && so('CT10') > so('CT02')) loi.CT10 = 'Số người trong độ tuổi lao động không thể nhiều hơn tổng nhân khẩu'
    if (coCT('CT11') && coCT('CT02') && !loi.CT11 && !loi.CT02 && so('CT11') > so('CT02')) loi.CT11 = 'Số người tham gia BHYT không thể nhiều hơn tổng nhân khẩu'

    ctCuaDot.forEach(ct => {
      if (dangXemLai && trangThaiCT[ct.ma] !== 'doi') return
      if (dangKeKhaiLai && !danhSachCTCanLai.find(item => item.ma === ct.ma)) return
      if (!ct.minhChung) return
      const canMinhChung =
        ct.loaiNhap === 'co-khong' ? duLieuCT[ct.ma] === true : parseInt(duLieuCT[ct.ma], 10) > 0
      if (canMinhChung && (!minhChungCT[ct.ma] || minhChungCT[ct.ma].length === 0)) {
        loi[`${ct.ma}_mc`] = 'Vui lòng tải lên minh chứng'
      }
    })

    return loi
  }

  const kiemTraBuoc = (soBuoc: any) => {
    const buoc = DANH_SACH_BUOC[soBuoc]
    if (!buoc || buoc.danhSachMa.length === 0) return {}
    const loi: Record<string, any> = {}
    buoc.danhSachMa.forEach(ma => {
      const ct = DANH_SACH_CT.find(c => c.ma === ma)
      if (!ct) return
      if (dangXemLai && trangThaiCT[ma] !== 'doi') return
      if (dangKeKhaiLai && !danhSachCTCanLai.find(item => item.ma === ma)) return
      const val = duLieuCT[ma]
      if (ct.loaiNhap === 'co-khong') {
        if (val === null || val === undefined) loi[ma] = 'Vui lòng chọn Có hoặc Không'
      } else {
        if (val === '' || val === undefined) { loi[ma] = 'Vui lòng nhập giá trị'; return }
        const so = parseInt(val, 10)
        if (isNaN(so)) { loi[ma] = 'Vui lòng nhập số, không nhập chữ'; return }
        if (so < 0) { loi[ma] = 'Giá trị không được nhỏ hơn 0'; return }
      }
    })

    const so = (ma: any) => {
      const ct = DANH_SACH_CT.find(c => c.ma === ma)
      if (ct && ct.loaiNhap === 'co-khong') return duLieuCT[ma] === true ? 1 : 0
      return parseInt(duLieuCT[ma], 10) || 0
    }

    if (buoc.danhSachMa.includes('CT02') && !loi.CT02 && so('CT02') < 1)
      loi.CT02 = 'Mỗi hộ phải có ít nhất 1 nhân khẩu (chủ hộ)'
    if (buoc.danhSachMa.includes('CT04') && buoc.danhSachMa.includes('CT03') && !loi.CT04 && !loi.CT03 && so('CT03') === 1 && so('CT04') === 1)
      loi.CT04 = 'Hộ không thể vừa nghèo vừa cận nghèo'
    if (buoc.danhSachMa.includes('CT05') && chiTieuDot.includes('CT02') && !loi.CT05 && so('CT05') > so('CT02'))
      loi.CT05 = 'Số người có công không thể nhiều hơn tổng nhân khẩu'
    if (buoc.danhSachMa.includes('CT06') && chiTieuDot.includes('CT02') && !loi.CT06 && so('CT06') > so('CT02'))
      loi.CT06 = 'Số đối tượng bảo trợ xã hội không thể nhiều hơn tổng nhân khẩu'
    if (buoc.danhSachMa.includes('CT07') && chiTieuDot.includes('CT02') && !loi.CT07 && so('CT07') > so('CT02'))
      loi.CT07 = 'Số trẻ em không thể nhiều hơn tổng nhân khẩu'
    if (buoc.danhSachMa.includes('CT08') && chiTieuDot.includes('CT07') && !loi.CT08 && so('CT08') > so('CT07'))
      loi.CT08 = 'Trẻ em hoàn cảnh đặc biệt không thể nhiều hơn tổng trẻ em'
    if (buoc.danhSachMa.includes('CT10') && chiTieuDot.includes('CT02') && !loi.CT10 && so('CT10') > so('CT02'))
      loi.CT10 = 'Số người trong độ tuổi lao động không thể nhiều hơn tổng nhân khẩu'
    if (buoc.danhSachMa.includes('CT11') && chiTieuDot.includes('CT02') && !loi.CT11 && so('CT11') > so('CT02'))
      loi.CT11 = 'Số người tham gia BHYT không thể nhiều hơn tổng nhân khẩu'

    buoc.danhSachMa.forEach(ma => {
      if (dangXemLai && trangThaiCT[ma] !== 'doi') return
      if (dangKeKhaiLai && !danhSachCTCanLai.find(item => item.ma === ma)) return
      const ct = DANH_SACH_CT.find(c => c.ma === ma)
      if (!ct || !ct.minhChung) return
      const canMC = ct.loaiNhap === 'co-khong' ? duLieuCT[ma] === true : parseInt(duLieuCT[ma], 10) > 0
      if (canMC && (!minhChungCT[ma] || minhChungCT[ma].length === 0))
        loi[`${ma}_mc`] = 'Vui lòng tải lên minh chứng'
    })

    return loi
  }

  const diTiepBuoc = () => {
    if (laBuocCuoi) return
    const loi = kiemTraBuoc(buocHienTai)
    setLoiCT(prev => ({ ...prev, ...loi }))
    if (Object.keys(loi).length > 0) return
    setBuocHienTai(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const quayLaiBuoc = () => {
    if (buocHienTai === 0) return
    setBuocHienTai(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nhayDenBuoc = (soBuoc) => {
    setBuocHienTai(soBuoc)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const xuLyBamNop = () => {
    const loi = kiemTraDuLieu()
    setLoiCT(loi)
    if (Object.keys(loi).length > 0) {
      const danhSachLoi = Object.entries(loi).map(([key, msg]) => {
        const maCT = key.replace('_mc', '')
        const ct = DANH_SACH_CT.find(c => c.ma === maCT)
        const tenCT = ct ? `${ct.ma} - ${ct.ten}` : key
        return { tenCT, msg }
      })
      setThongBaoLoi(danhSachLoi)
      return
    }
    setMoXacNhanNop(true)
  }

  const xacNhanNop = async () => {
    setMoXacNhanNop(false)
    setDangNop(true)
    try {
      const so = (ma) => {
        if (!chiTieuDot.includes(ma)) return null
        const ct = DANH_SACH_CT.find(c => c.ma === ma)
        if (ct && ct.loaiNhap === 'co-khong') return duLieuCT[ma] === true ? 1 : 0
        return parseInt(duLieuCT[ma], 10) || 0
      }

      const dsSua = dangXemLai
        ? Object.entries(trangThaiCT).filter(([, v]) => v === 'doi').map(([ma]) => ma)
        : null

      const body = {
        dot_id: dotDangChon.id,
        ho_dan_id: hoDanId,
        ct02_tong_nhan_khau: so('CT02'),
        ct03_ho_ngheo: so('CT03'),
        ct04_ho_can_ngheo: so('CT04'),
        ct05_nguoi_co_cong: so('CT05'),
        ct06_bao_tro_xh: so('CT06'),
        ct07_tre_duoi_16: so('CT07'),
        ct08_tre_hoan_canh: so('CT08'),
        ct10_tuoi_lao_dong: so('CT10'),
        ct11_tham_gia_bhyt: so('CT11'),
        ghi_chu: ghiChu.trim() || null,
        danh_sach_thay_doi: dsSua,
      }

      const keKhaiMoi = await api.post('/declarations', body)

      if (keKhaiMoi?.id) {
        const danhSachUpload: any[] = []
        Object.entries(minhChungCT).forEach(([ma, dsFile]: [string, any]) => {
          if (!dsFile || dsFile.length === 0) return
          dsFile.forEach((item: any) => {
            if (!item.file) return
            const formData = new FormData()
            formData.append('file', item.file)
            formData.append('ke_khai_ho_id', keKhaiMoi.id)
            formData.append('ma_chi_tieu', ma)
            danhSachUpload.push(api.upload('/evidence', formData))
          })
        })
        if (danhSachUpload.length > 0) {
          const ketQua = await Promise.allSettled(danhSachUpload)
          const soLoi = ketQua.filter(r => r.status === 'rejected').length
          if (soLoi > 0) {
            alert(`Cảnh báo: ${soLoi}/${ketQua.length} minh chứng tải lên thất bại. Vui lòng kiểm tra lại.`)
          }
        }
      }

      const trangThaiMoi = (dsSua && dsSua.length === 0) ? 'da-ke-khai' : 'cho-duyet'
      setDuLieuDaNop(prev => ({ ...prev, [dotDangChon.id]: { ...duLieuCT } }))
      setDanhSachDot(prev => prev.map(d =>
        d.id === dotDangChon.id ? { ...d, trangThai: trangThaiMoi, ghiChuChung: undefined, danhSachTraLai: undefined } : d
      ))
      setMoPopup(false)
      setDangXemLai(false)
      setDangKeKhaiLai(false)
      setDanhSachCTCanLai([])
      setTrangThaiCT({})
      setThongBaoLoi(null)
      setBuocHienTai(0)
      setHienToast(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      console.error('Loi nop ke khai:', err)
      setThongBaoLoi([{ tenCT: 'Lỗi hệ thống', msg: err.error || 'Không thể nộp kê khai, vui lòng thử lại' }])
    } finally {
      setDangNop(false)
    }
  }

  const danhSachCTDaSua = () => {
    if (!dangXemLai || Object.keys(duLieuGoc).length === 0) return []
    return ctCuaDot.filter(ct => duLieuCT[ct.ma] !== duLieuGoc[ct.ma])
  }

  const danhSachDaLoc = [...danhSachDot]
    .sort((a: any, b: any) => new Date(a.ngayMo).getTime() - new Date(b.ngayMo).getTime())
    .filter(d => boLoc === 'tat-ca' || d.trangThai === boLoc)

  const xuLyBamNut = (dot: any) => {
    if (dot.trangThai === 'da-ke-khai' || dot.trangThai === 'chua-ke-khai' || dot.trangThai === 'yeu-cau-lai') {
      moFormKeKhai(dot)
    }
  }

  const demTheoTrangThai = (tt) => danhSachDot.filter((d) => d.trangThai === tt).length

  if (dangTaiDuLieu) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  const manHinhDanhSach = (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Tiêu đề + Thống kê */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="text-white" size={20} />
            </div>
            Kê Khai Dữ Liệu
          </h1>
        </div>
        <p className="text-slate-500 mt-2 ml-[52px]">Danh sách các đợt kê khai dữ liệu hộ gia đình</p>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-5 md:mt-6">
          <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4
            transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-slate-800">{demTheoTrangThai('chua-ke-khai')}</p>
              <p className="text-xs md:text-sm text-slate-500">Chưa kê khai</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4
            transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-slate-800">{demTheoTrangThai('cho-duyet')}</p>
              <p className="text-xs md:text-sm text-slate-500">Chờ duyệt</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4
            transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]">
            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <RotateCcw size={20} className="text-orange-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-slate-800">{demTheoTrangThai('yeu-cau-lai')}</p>
              <p className="text-xs md:text-sm text-slate-500">Yêu cầu kê khai lại</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4
            transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-slate-800">{demTheoTrangThai('da-ke-khai')}</p>
              <p className="text-xs md:text-sm text-slate-500">Đã kê khai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh lọc trượt */}
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-600 mb-3">Lọc theo trạng thái:</p>
        <ThanhLocTruot
          boLoc={boLoc}
          setBoLoc={setBoLoc}
          danhSachTab={[
            { key: 'tat-ca', label: 'Tất cả', soLuong: danhSachDot.length },
            { key: 'da-ke-khai', label: 'Đã kê khai', soLuong: demTheoTrangThai('da-ke-khai') },
            { key: 'cho-duyet', label: 'Chờ duyệt', soLuong: demTheoTrangThai('cho-duyet') },
            { key: 'yeu-cau-lai', label: 'Yêu cầu kê khai lại', soLuong: demTheoTrangThai('yeu-cau-lai') },
            { key: 'chua-ke-khai', label: 'Chưa kê khai', soLuong: demTheoTrangThai('chua-ke-khai') },
            { key: 'qua-han', label: 'Quá hạn', soLuong: demTheoTrangThai('qua-han') },
          ]}
        />
      </div>

      {/* Danh sách card */}
      <div className="space-y-4">
        {danhSachDaLoc.map((dot) => {
          const soNgay = tinhSoNgay(dot.ngayDong)
          const laQuaHan = dot.trangThai === 'qua-han' || (soNgay < 0 && dot.trangThai === 'chua-ke-khai')
          const daKeKhai = dot.trangThai === 'da-ke-khai'
          const choDuyet = dot.trangThai === 'cho-duyet'
          const yeuCauLai = dot.trangThai === 'yeu-cau-lai'
          const chuaKeKhai = dot.trangThai === 'chua-ke-khai' && !laQuaHan

          let mauVien = 'border-slate-200'
          if (daKeKhai) mauVien = 'border-emerald-200'
          else if (yeuCauLai) mauVien = 'border-orange-300'
          else if (choDuyet) mauVien = 'border-amber-200'
          else if (laQuaHan) mauVien = 'border-red-200'
          else if (chuaKeKhai) mauVien = 'border-blue-200'

          return (
            <div
              key={dot.id}
              onClick={() => (chuaKeKhai || daKeKhai || yeuCauLai) && xuLyBamNut(dot)}
              className={`bg-white rounded-xl border ${mauVien} p-4 md:p-5
                transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]
                ${chuaKeKhai || daKeKhai || yeuCauLai ? 'cursor-pointer' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5">
                <div className="flex items-start gap-3 md:gap-5 flex-1 min-w-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${dot.loai === 'dinh-ky'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    {dot.loai === 'dinh-ky'
                      ? <CalendarClock size={20} />
                      : <Zap size={20} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${dot.loai === 'dinh-ky'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {dot.loai === 'dinh-ky' ? 'Định kỳ' : 'Đột xuất'}
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-800">{dot.tenDot}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs md:text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {formatNgay(dot.ngayMo)} — {formatNgay(dot.ngayDong)}
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium
                        ${daKeKhai
                          ? 'text-emerald-600'
                          : yeuCauLai
                            ? 'text-orange-600'
                            : choDuyet
                              ? 'text-amber-600'
                              : laQuaHan
                                ? 'text-red-500'
                                : soNgay <= 3
                                  ? 'text-indigo-500'
                                  : 'text-blue-600'
                        }`}
                      >
                        <Clock size={13} />
                        {daKeKhai
                          ? 'Đã hoàn thành'
                          : yeuCauLai
                            ? 'Cần kê khai lại'
                            : choDuyet
                              ? 'Đang chờ duyệt'
                              : laQuaHan
                            ? `Quá hạn ${Math.abs(soNgay)} ngày`
                            : soNgay === 0
                              ? 'Hết hạn hôm nay'
                              : `Còn ${soNgay} ngày`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {daKeKhai ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); xuLyBamNut(dot) }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl
                      hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25
                      transition-all duration-300 active:translate-y-0 active:scale-[0.98] active:shadow-sm flex-shrink-0"
                  >
                    <CheckCircle2 size={16} />
                    Đã kê khai
                  </button>
                ) : yeuCauLai ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); xuLyBamNut(dot) }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl
                      hover:bg-orange-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25
                      transition-all duration-300 active:translate-y-0 active:scale-[0.98] active:shadow-sm flex-shrink-0"
                  >
                    <RotateCcw size={16} />
                    Kê khai lại
                  </button>
                ) : choDuyet ? (
                  <button
                    disabled
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-500 text-sm font-medium rounded-xl
                      cursor-not-allowed flex-shrink-0"
                  >
                    <Clock size={16} />
                    Chờ duyệt
                  </button>
                ) : laQuaHan ? (
                  <button
                    disabled
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-100 text-red-400 text-sm font-medium rounded-xl
                      cursor-not-allowed flex-shrink-0"
                  >
                    <AlertCircle size={16} />
                    Đã quá hạn
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); xuLyBamNut(dot) }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl
                      hover:bg-blue-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25
                      transition-all duration-300 active:translate-y-0 active:scale-[0.98] active:shadow-sm flex-shrink-0"
                  >
                    <FileText size={16} />
                    Kê khai ngay
                  </button>
                )}
              </div>
              {yeuCauLai && (dot.ghiChuChung || dot.danhSachTraLai?.length > 0) && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                  {dot.ghiChuChung && (
                    <div>
                      <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-1.5">
                        <Info size={13} />
                        Ghi chú từ cán bộ thôn:
                      </p>
                      <p className="text-sm text-orange-600">{dot.ghiChuChung}</p>
                    </div>
                  )}
                  {dot.danhSachTraLai?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-orange-700 mb-1">Chỉ tiêu cần kê khai lại:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dot.danhSachTraLai.map(item => (
                          <span key={item.ma} className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            {item.ma}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )

  const manHinhKeKhai = (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header với nút quay lại */}
      <div className="mb-6">
        <button
          onClick={() => !dangNop && setMoPopup(false)}
          disabled={dangNop}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </button>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="text-white" size={20} />
          </div>
          Kê khai dữ liệu
        </h1>
        <p className="text-slate-500 mt-2 ml-[52px]">{dotDangChon?.tenDot}</p>
      </div>

      {/* Chế độ chỉ xem */}
      {chiXem && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-base font-semibold text-slate-800">Đợt này đã kê khai xong</p>
            <p className="text-sm text-slate-500 mt-1">Dưới đây là dữ liệu bạn đã nộp. Chỉ xem, không chỉnh sửa được.</p>
          </div>
        </div>
      )}

      {/* Hướng dẫn lần đầu */}
      {!chiXem && !dangXemLai && !dangKeKhaiLai && (
        <div className="mb-6 p-3 bg-blue-50 rounded-xl flex items-start gap-3">
          <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Vui lòng kê khai <strong>chính xác, đúng thực tế</strong> và đính kèm <strong>minh chứng</strong> (ảnh chụp giấy tờ) cho từng chỉ tiêu. Dữ liệu sai có thể bị cán bộ thôn trả lại để kê khai lại.
          </p>
        </div>
      )}

      {/* Hướng dẫn kê khai lại */}
      {dangKeKhaiLai && (
        <div className="mb-6 space-y-3">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
            <RotateCcw size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Cán bộ thôn yêu cầu kê khai lại {danhSachCTCanLai.length} chỉ tiêu</p>
              <p className="text-sm text-orange-600 mt-1">Chỉ những chỉ tiêu được yêu cầu mới cần nhập lại. Các chỉ tiêu còn lại giữ nguyên giá trị cũ.</p>
            </div>
          </div>
          {dotDangChon?.ghiChuChung && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-600 mb-1">Ghi chú từ cán bộ thôn:</p>
              <p className="text-sm text-slate-700">{dotDangChon.ghiChuChung}</p>
            </div>
          )}
        </div>
      )}

      {/* Hướng dẫn kê khai lần 2+ */}
      {!chiXem && dangXemLai && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Info size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Dữ liệu lần trước đã được tải sẵn. Với mỗi chỉ tiêu, hãy chọn <strong>Giữ nguyên</strong> hoặc <strong>Sửa đổi</strong>. Chỉ tiêu nào giữ nguyên thì không cần tải lại minh chứng.
          </p>
        </div>
      )}

      {/* Thanh tiến trình chốt CT */}
      {!chiXem && dangXemLai && (
        <div className="mb-5 p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Tiến trình kê khai</span>
            <span className="text-sm font-bold text-blue-600">{Object.keys(daChot).length}/{ctCuaDot.length}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(Object.keys(daChot).length / ctCuaDot.length) * 100}%` }}
            />
          </div>
          {Object.keys(daChot).length === ctCuaDot.length && (
            <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={13} />
              Đã nhập đủ! Bấm "Nộp kê khai" bên dưới để hoàn tất.
            </p>
          )}
        </div>
      )}

      {/* Form nhập liệu / xem lại */}
      {(chiXem || dangXemLai || !dangXemLai) && <div className="space-y-4 mb-6">
        {ctCuaDot.map((ct) => {
          const dangGiu = dangXemLai && trangThaiCT[ct.ma] === 'giu'
          const dangSua = dangXemLai && trangThaiCT[ct.ma] === 'doi'
          const ctCanLai = danhSachCTCanLai.find(item => item.ma === ct.ma)
          const biKhoaKeKhaiLai = dangKeKhaiLai && !ctCanLai
          const coLoi = !chiXem && !dangGiu && loiCT[ct.ma]
          const coLoiMC = !chiXem && !dangGiu && loiCT[`${ct.ma}_mc`]
          const danhSachFile = minhChungCT[ct.ma] || []
          const canHienMinhChung = !chiXem && !dangGiu && !biKhoaKeKhaiLai && ct.minhChung && (
            ct.loaiNhap === 'co-khong' ? duLieuCT[ct.ma] === true : parseInt(duLieuCT[ct.ma], 10) > 0
          )
          const daDuocChot = !chiXem && !dangXemLai && daChot[ct.ma]
          const dangChotCT = !chiXem && !dangXemLai && dangChot[ct.ma]

          const hienGiaTri = () => {
            if (ct.loaiNhap === 'co-khong') {
              return duLieuCT[ct.ma] === true ? 'Có' : duLieuCT[ct.ma] === false ? 'Không' : '—'
            }
            const val = duLieuCT[ct.ma]
            return val === '' || val === null || val === undefined ? '—' : String(val)
          }

          const daSua = dangXemLai && Object.keys(duLieuGoc).length > 0 && duLieuCT[ct.ma] !== duLieuGoc[ct.ma]
          const dangReadOnly = chiXem || dangGiu || biKhoaKeKhaiLai

          if (daDuocChot) {
            return (
              <div key={ct.ma} className={`rounded-xl border p-4 transition-all duration-300
                ${daSua ? 'border-amber-300 bg-amber-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-${ct.mau}-100 text-${ct.mau}-700`}>
                          {ct.ma}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{ct.ten}</span>
                        {daSua && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            Đã sửa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-bold text-emerald-700">{hienGiaTri()}</span>
                        {danhSachFile.length > 0 && (
                          <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {danhSachFile.length} minh chứng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => moLaiChiTieu(ct.ma)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500
                      hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-md
                      transition-all duration-300 active:scale-95 flex-shrink-0"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={ct.ma} className={`rounded-xl border p-4 transition-all duration-300
              ${dangChotCT
                ? 'border-emerald-300 bg-emerald-50/50 opacity-60'
                : biKhoaKeKhaiLai ? 'border-slate-200 bg-slate-50/50 opacity-70'
                : ctCanLai ? 'border-orange-300 bg-orange-50/30 hover:shadow-md'
                : coLoi || coLoiMC ? 'border-red-300 bg-red-50/50 hover:shadow-md'
                : dangGiu ? 'border-emerald-200 bg-emerald-50/30 hover:shadow-md'
                : daSua ? 'border-amber-300 bg-amber-50/30 hover:shadow-md'
                : 'border-slate-200 hover:border-blue-200 hover:shadow-md'}`}>
              <div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-${ct.mau}-100 text-${ct.mau}-700`}>
                      {ct.ma}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{ct.ten}</span>
                    {biKhoaKeKhaiLai && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Giữ nguyên
                      </span>
                    )}
                    {ctCanLai && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                        Cần kê khai lại
                      </span>
                    )}
                    {daSua && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        Đã sửa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{ct.moTa}</p>
                  {ctCanLai?.ghiChu && (
                    <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs text-orange-700 flex items-center gap-1.5">
                        <Info size={12} className="flex-shrink-0" />
                        <span><strong>Ghi chú cán bộ:</strong> {ctCanLai.ghiChu}</span>
                      </p>
                    </div>
                  )}

                  {dangXemLai && !chiXem && (
                    <div className="relative bg-slate-100 rounded-xl p-1 flex mb-3">
                      <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-md transition-all duration-300 ease-in-out
                          ${dangSua ? 'translate-x-[calc(100%+8px)] bg-blue-500' : 'translate-x-0 bg-emerald-500'}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setTrangThaiCT(prev => ({ ...prev, [ct.ma]: 'giu' }))
                          if (duLieuGoc[ct.ma] !== undefined) {
                            setDuLieuCT(prev => ({ ...prev, [ct.ma]: duLieuGoc[ct.ma] }))
                          }
                        }}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-300
                          ${dangGiu ? 'text-white' : 'text-slate-500'}`}
                      >
                        <CheckCircle2 size={14} />
                        Giữ nguyên
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTrangThaiCT(prev => ({ ...prev, [ct.ma]: 'doi' }))
                          const ctData = DANH_SACH_CT.find(c => c.ma === ct.ma)
                          setDuLieuCT(prev => ({ ...prev, [ct.ma]: ctData.loaiNhap === 'co-khong' ? null : '' }))
                          setMinhChungCT(prev => ({ ...prev, [ct.ma]: [] }))
                        }}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-300
                          ${dangSua ? 'text-white' : 'text-slate-500'}`}
                      >
                        <Pencil size={14} />
                        Sửa đổi
                      </button>
                    </div>
                  )}

                  {dangReadOnly ? (
                    <div className={`px-4 py-2.5 rounded-xl border text-base font-medium
                      ${dangGiu ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      {hienGiaTri()}
                      {dangGiu && <span className="ml-2 text-xs font-normal text-emerald-500">(giữ nguyên)</span>}
                    </div>
                  ) : ct.loaiNhap === 'co-khong' ? (
                    <div className="relative bg-slate-100 rounded-xl p-1 flex">
                      <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-md transition-all duration-300 ease-in-out
                          ${duLieuCT[ct.ma] === null || duLieuCT[ct.ma] === undefined
                            ? 'opacity-0'
                            : duLieuCT[ct.ma] === false
                              ? 'translate-x-[calc(100%+8px)] bg-slate-500'
                              : 'translate-x-0 bg-blue-500'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => capNhatGiaTri(ct.ma, true)}
                        className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300
                          ${duLieuCT[ct.ma] === true ? 'text-white' : 'text-slate-500'}`}
                      >
                        Có
                      </button>
                      <button
                        type="button"
                        onClick={() => capNhatGiaTri(ct.ma, false)}
                        className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300
                          ${duLieuCT[ct.ma] === false ? 'text-white' : 'text-slate-500'}`}
                      >
                        Không
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={duLieuCT[ct.ma] || ''}
                      onChange={(e) => capNhatGiaTri(ct.ma, e.target.value)}
                      onBlur={() => tuDongChot(ct.ma)}
                      placeholder="Nhập số..."
                      className={`w-full px-4 py-2.5 text-base rounded-xl border transition-all duration-200 outline-none
                        ${coLoi
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                          : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                        }`}
                    />
                  )}

                  {!dangReadOnly && layGoiY(ct.ma) && (
                    <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                      <Info size={11} className="flex-shrink-0" />
                      {layGoiY(ct.ma)}
                    </p>
                  )}

                  {coLoi && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {coLoi}
                    </p>
                  )}

                  {canHienMinhChung && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-600 mb-1">Minh chứng cần tải lên:</p>
                      <p className="text-xs text-slate-400 mb-2">{ct.minhChung}</p>

                      {danhSachFile.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {danhSachFile.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                              {f.file.type.startsWith('image/') ? (
                                <img src={f.url} alt={f.ten} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                  <FileText size={16} className="text-emerald-600" />
                                </div>
                              )}
                              <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{f.ten}</span>
                              <button
                                type="button"
                                onClick={() => xoaMinhChung(ct.ma, i)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors text-slate-400 hover:text-red-500 flex-shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[ct.ma] = el }}
                        onChange={(e) => { xuLyChonFile(ct.ma, e.target.files); e.target.value = '' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[ct.ma]?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium
                          hover:bg-blue-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25
                          transition-all duration-300 active:translate-y-0 active:scale-[0.98]"
                      >
                        <Upload size={16} />
                        Tải lên minh chứng
                      </button>

                      {coLoiMC && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {coLoiMC}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )
        })}
      </div>}

      {/* Tổng kết thay đổi */}
      {dangXemLai && Object.keys(duLieuGoc).length > 0 && (() => {
        const soDaSua = ctCuaDot.filter(ct => duLieuCT[ct.ma] !== duLieuGoc[ct.ma]).length
        return soDaSua > 0 ? (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <Pencil size={16} className="text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800">
              Bạn đã thay đổi <strong>{soDaSua}</strong> chỉ tiêu so với lần trước.
            </span>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span className="text-sm text-emerald-800">Chưa có thay đổi nào so với lần trước.</span>
          </div>
        )
      })()}

      {/* Ghi chú cho thôn trưởng */}
      {!chiXem && (
        <div className="mb-4 p-4 bg-white rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-blue-500" />
            Ghi chú cho thôn trưởng
            <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="VD: Đã cập nhật lại CT03, xin thôn trưởng kiểm tra giúp..."
            rows={2}
            maxLength={500}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors placeholder:text-slate-400 resize-none"
          />
          {ghiChu.length > 0 && (
            <p className="text-xs text-slate-400 mt-1 text-right">{ghiChu.length}/500</p>
          )}
        </div>
      )}

      {/* Footer */}
      {chiXem ? (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 -mx-4 md:-mx-6 px-4 md:px-6 py-4 flex items-center justify-center">
          <button
            onClick={() => setMoPopup(false)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl
              hover:bg-slate-200 hover:-translate-y-0.5 hover:shadow-md
              transition-all duration-300 active:translate-y-0 active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </button>
        </div>
      ) : (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 -mx-4 md:-mx-6 px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => !dangNop && setMoPopup(false)}
            disabled={dangNop}
            className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl
              hover:bg-slate-200 hover:-translate-y-0.5 hover:shadow-md
              transition-all duration-300 active:translate-y-0 active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            onClick={xuLyBamNop}
            disabled={dangNop}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-xl
              hover:bg-blue-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25
              transition-all duration-300 active:translate-y-0 active:scale-[0.98] active:shadow-sm
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {dangNop ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang nộp...
              </>
            ) : (
              <>
                <Send size={16} />
                Nộp kê khai
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {moPopup && dotDangChon ? manHinhKeKhai : manHinhDanhSach}

      {/* Popup xác nhận nộp */}
      {moXacNhanNop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoXacNhanNop(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4
              ${dangXemLai && danhSachCTDaSua().length > 0 ? 'bg-amber-50' : 'bg-blue-50'}`}>
              {dangXemLai && danhSachCTDaSua().length > 0
                ? <Pencil size={28} className="text-amber-500" />
                : dangXemLai
                  ? <CheckCircle2 size={28} className="text-emerald-500" />
                  : <Send size={28} className="text-blue-500" />
              }
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {dangXemLai && danhSachCTDaSua().length > 0
                ? 'Xác nhận nộp thay đổi'
                : dangXemLai
                  ? 'Giữ nguyên dữ liệu?'
                  : 'Xác nhận nộp kê khai'
              }
            </h3>
            {dangXemLai && danhSachCTDaSua().length > 0 ? (
              <div className="text-left mb-5">
                <p className="text-sm text-slate-500 mb-3">Bạn đã thay đổi {danhSachCTDaSua().length} chỉ tiêu:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {danhSachCTDaSua().map(ct => (
                    <div key={ct.ma} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded bg-${ct.mau}-100 text-${ct.mau}-700`}>{ct.ma}</span>
                      <span className="text-xs text-slate-700 flex-1">{ct.ten}</span>
                      <span className="text-xs text-slate-400">{ct.loaiNhap === 'co-khong' ? (duLieuGoc[ct.ma] === true ? 'Có' : duLieuGoc[ct.ma] === false ? 'Không' : '—') : (duLieuGoc[ct.ma] === '' || duLieuGoc[ct.ma] === null || duLieuGoc[ct.ma] === undefined ? '—' : String(duLieuGoc[ct.ma]))}</span>
                      <span className="text-xs text-slate-400">→</span>
                      <span className="text-xs font-semibold text-amber-700">{ct.loaiNhap === 'co-khong' ? (duLieuCT[ct.ma] === true ? 'Có' : duLieuCT[ct.ma] === false ? 'Không' : '—') : (duLieuCT[ct.ma] === '' || duLieuCT[ct.ma] === null || duLieuCT[ct.ma] === undefined ? '—' : String(duLieuCT[ct.ma]))}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-3">Bạn có chắc chắn muốn nộp?</p>
              </div>
            ) : dangXemLai ? (
              <p className="text-sm text-slate-500 mb-5">
                Dữ liệu không có thay đổi so với lần trước. Bạn có chắc chắn <strong>giữ nguyên</strong> và nộp?
              </p>
            ) : (
              <p className="text-sm text-slate-500 mb-5">
                Vui lòng kiểm tra lại dữ liệu trước khi nộp. Bạn có chắc chắn muốn <strong>nộp kê khai</strong>?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setMoXacNhanNop(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl
                  hover:bg-slate-200 transition-all duration-300 active:scale-[0.97]"
              >
                Quay lại
              </button>
              <button
                onClick={xacNhanNop}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-xl
                  hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/25
                  transition-all duration-300 active:scale-[0.97]"
              >
                <Send size={16} />
                Nộp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo lỗi */}
      <Toast
        hien={hienToast}
        noiDung="Kê khai thành công!"
        dongToast={() => setHienToast(false)}
      />

      {thongBaoLoi && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-[420px] animate-[slideDown_0.4s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="relative rounded-2xl overflow-hidden group">
            {/* SVG viền chạy vòng */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
              <rect
                x="1" y="1"
                width="calc(100% - 2px)" height="calc(100% - 2px)"
                rx="16" ry="16"
                fill="none"
                stroke="url(#vienDo)"
                strokeWidth="2.5"
                strokeDasharray="1200"
                strokeDashoffset="0"
                onAnimationEnd={() => setThongBaoLoi(null)}
                className="animate-[vienChay_5s_linear_forwards] group-hover:[animation-play-state:paused]"
              />
              <defs>
                <linearGradient id="vienDo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>

            {/* Nội dung toast */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(239,68,68,0.15)] p-5" style={{ zIndex: 1 }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <AlertCircle size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">Chưa thể nộp</p>
                    <p className="text-xs text-slate-400 mt-0.5">Có {thongBaoLoi.length} mục cần kiểm tra lại</p>
                  </div>
                </div>
                <button
                  onClick={() => setThongBaoLoi(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-300 hover:text-slate-600 hover:rotate-90 duration-300"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Danh sách lỗi */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                {thongBaoLoi.map((loi, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50/50 border border-red-100/60">
                    <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">{i + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 leading-tight">{loi.tenCT}</p>
                      <p className="text-[11px] text-red-500 mt-0.5 leading-snug">{loi.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
