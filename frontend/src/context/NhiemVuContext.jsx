import { createContext, useContext, useState, useCallback } from 'react'
import { duLieuMau, danhSach10Thon } from '../pages/xa/nhiem-vu/constants'

const NhiemVuContext = createContext(null)

const SO_HO_MAC_DINH = 245

function taoGiaTriCT(chiTieu) {
  const duLieuCT = {}
  chiTieu.forEach(ct => {
    const giaTriMau = {
      'CT01': 180 + Math.floor(Math.random() * 120),
      'CT02': 600 + Math.floor(Math.random() * 400),
      'CT03': Math.floor(Math.random() * 20),
      'CT04': Math.floor(Math.random() * 15),
      'CT05': Math.floor(Math.random() * 10),
      'CT06': Math.floor(Math.random() * 12),
      'CT07': 50 + Math.floor(Math.random() * 80),
      'CT08': Math.floor(Math.random() * 5),
      'CT09': 100 + Math.floor(Math.random() * 80),
      'CT10': 200 + Math.floor(Math.random() * 300),
      'CT11': 300 + Math.floor(Math.random() * 400),
      'CT12': 5 + Math.floor(Math.random() * 15),
      'CT13': 10 + Math.floor(Math.random() * 30),
      'CT14': Math.floor(Math.random() * 3),
    }
    duLieuCT[ct] = giaTriMau[ct] ?? 0
  })
  return duLieuCT
}

function taoDuLieuThonBanDau(nhiemVu) {
  return danhSach10Thon.map((ten, i) => {
    const daNop = i < nhiemVu.soThonDaNop
    if (!daNop) return { ten, daNop: false }

    const ngayNop = new Date(nhiemVu.ngayBatDau)
    ngayNop.setDate(ngayNop.getDate() + Math.floor(Math.random() * 30) + 5)

    return {
      ten,
      daNop: true,
      ngayNop: ngayNop.toISOString().split('T')[0],
      duLieuCT: taoGiaTriCT(nhiemVu.chiTieu),
    }
  })
}

function taoSoHoDaNop(nhiemVu) {
  if (nhiemVu.soThonDaNop === nhiemVu.tongSoThon) return SO_HO_MAC_DINH
  if (nhiemVu.soThonDaNop === 0) return 0
  return Math.floor(SO_HO_MAC_DINH * (0.4 + Math.random() * 0.5))
}

export function NhiemVuProvider({ children }) {
  const [danhSachNhiemVu, setDanhSachNhiemVu] = useState(duLieuMau)

  const [tienDoThon, setTienDoThon] = useState(() => {
    const map = {}
    duLieuMau.forEach(nv => {
      map[nv.id] = taoDuLieuThonBanDau(nv)
    })
    return map
  })

  const [soHoDaNopTheoNV] = useState(() => {
    const map = {}
    duLieuMau.forEach(nv => {
      map[nv.id] = taoSoHoDaNop(nv)
    })
    return map
  })

  const themNhiemVu = useCallback((nhiemVuMoi) => {
    setDanhSachNhiemVu(prev => [nhiemVuMoi, ...prev])
    setTienDoThon(prev => ({
      ...prev,
      [nhiemVuMoi.id]: danhSach10Thon.map(ten => ({ ten, daNop: false })),
    }))
  }, [])

  const layNhiemVuChoThon = useCallback((tenThon) => {
    return danhSachNhiemVu.map(nv => ({
      ...nv,
      soHoDaNop: soHoDaNopTheoNV[nv.id] ?? 0,
      tongSoHo: SO_HO_MAC_DINH,
    }))
  }, [danhSachNhiemVu, soHoDaNopTheoNV])

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
      themNhiemVu,
      layNhiemVuChoThon,
      layTienDoThon,
      capNhatTienDoThon,
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
