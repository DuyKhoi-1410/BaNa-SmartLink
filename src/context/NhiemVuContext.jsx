import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

const NhiemVuContext = createContext(null)

const TAT_CA_CT = ['CT01','CT02','CT03','CT04','CT05','CT06','CT07','CT08','CT09','CT10','CT11','CT12','CT13','CT14']

function chuyenDoiDot(dot) {
  return {
    id: dot.id,
    ten: dot.ten_dot,
    loai: dot.loai === 'dinh_ky' ? 'dinh-ky' : 'dot-xuat',
    quy: dot.quy,
    nam: dot.nam,
    moTa: dot.mo_ta || '',
    chiTiet: dot.mo_ta || '',
    chiTieu: TAT_CA_CT,
    ngayBatDau: dot.ngay_bat_dau?.slice(0, 10),
    ngayHetHan: dot.ngay_ket_thuc?.slice(0, 10),
    trangThaiDot: dot.trang_thai,
    soThonDaNop: 0,
    tongSoThon: 10,
  }
}

export function NhiemVuProvider({ children }) {
  const { nguoiDung } = useAuth()
  const [danhSachNhiemVu, setDanhSachNhiemVu] = useState([])
  const [tienDoThon, setTienDoThon] = useState({})
  const [dangTai, setDangTai] = useState(true)

  const taiDanhSach = useCallback(async () => {
    try {
      setDangTai(true)
      const danhSachDot = await api.get('/periods')
      const danhSachChuyenDoi = danhSachDot.map(chuyenDoiDot)

      const tienDoMoi = {}
      for (const dot of danhSachChuyenDoi) {
        try {
          const tienDo = await api.get(`/reports/tien-do/${dot.id}`)
          if (Array.isArray(tienDo)) {
            const dsThon = tienDo.map(t => ({
              ten: t.ten_thon,
              thonId: t.thon_id,
              daNop: t.da_ke_khai > 0 || t.da_duyet > 0,
              tongHo: t.tong_ho,
              daKeKhai: t.da_ke_khai,
              daDuyet: t.da_duyet,
              traLai: t.tra_lai,
            }))
            tienDoMoi[dot.id] = dsThon
            dot.soThonDaNop = dsThon.filter(t => t.daNop).length
          }
        } catch {
          tienDoMoi[dot.id] = []
        }
      }

      setDanhSachNhiemVu(danhSachChuyenDoi)
      setTienDoThon(tienDoMoi)
    } catch (err) {
      console.error('Loi tai danh sach dot ke khai:', err)
    } finally {
      setDangTai(false)
    }
  }, [])

  useEffect(() => {
    if (nguoiDung) {
      taiDanhSach()
    } else {
      setDanhSachNhiemVu([])
      setTienDoThon({})
      setDangTai(false)
    }
  }, [nguoiDung, taiDanhSach])

  const themNhiemVu = useCallback(async (duLieuForm) => {
    try {
      const body = {
        ten_dot: duLieuForm.ten,
        mo_ta: duLieuForm.chiTiet || '',
        loai: duLieuForm.loai === 'dinh-ky' ? 'dinh_ky' : 'dot_xuat',
        nam: new Date(duLieuForm.ngayBatDau).getFullYear(),
        ngay_bat_dau: duLieuForm.ngayBatDau,
        ngay_ket_thuc: duLieuForm.ngayHetHan,
      }
      if (duLieuForm.quy) body.quy = duLieuForm.quy

      const dotMoi = await api.post('/periods', body)
      const nhiemVuMoi = chuyenDoiDot(dotMoi)
      setDanhSachNhiemVu(prev => [nhiemVuMoi, ...prev])
      setTienDoThon(prev => ({ ...prev, [nhiemVuMoi.id]: [] }))
      return nhiemVuMoi
    } catch (err) {
      console.error('Loi tao dot ke khai:', err)
      throw err
    }
  }, [])

  const layNhiemVuChoThon = useCallback(() => {
    return danhSachNhiemVu
  }, [danhSachNhiemVu])

  const layTienDoThon = useCallback((nhiemVuId) => {
    return tienDoThon[nhiemVuId] || []
  }, [tienDoThon])

  const capNhatTienDoThon = useCallback((nhiemVuId, tenThon, duLieu) => {
    setTienDoThon(prev => {
      const ds = prev[nhiemVuId] || []
      return {
        ...prev,
        [nhiemVuId]: ds.map(t =>
          t.ten === tenThon ? { ...t, ...duLieu } : t
        ),
      }
    })
    if (duLieu.daNop) {
      setDanhSachNhiemVu(prev => prev.map(nv => {
        if (nv.id !== nhiemVuId) return nv
        const dsThon = tienDoThon[nhiemVuId] || []
        const soThonDaNopMoi = dsThon.filter(t =>
          t.ten === tenThon ? duLieu.daNop : t.daNop
        ).length
        return { ...nv, soThonDaNop: soThonDaNopMoi }
      }))
    }
  }, [tienDoThon])

  return (
    <NhiemVuContext.Provider value={{
      danhSachNhiemVu,
      dangTai,
      themNhiemVu,
      layNhiemVuChoThon,
      layTienDoThon,
      capNhatTienDoThon,
      taiLaiDuLieu: taiDanhSach,
    }}>
      {children}
    </NhiemVuContext.Provider>
  )
}

export function useNhiemVu() {
  const ctx = useContext(NhiemVuContext)
  if (!ctx) throw new Error('useNhiemVu phải dùng trong NhiemVuProvider')
  return ctx
}
