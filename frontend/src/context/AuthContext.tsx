import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, tokenStore } from '../lib/api'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [nguoiDung, setNguoiDung] = useState<any>(null)
  const [dangTai, setDangTai] = useState(true)

  useEffect(() => {
    const token = tokenStore.getAccess()
    if (!token) {
      setDangTai(false)
      return
    }
    api.get('/auth/me')
      .then(res => setNguoiDung(res.user))
      .catch(() => tokenStore.clear())
      .finally(() => setDangTai(false))
  }, [])

  // Nhan ca access + refresh token khi dang nhap
  const dangNhap = useCallback((accessToken: string, refreshToken: string, user: any) => {
    tokenStore.set(accessToken, refreshToken)
    setNguoiDung(user)
  }, [])

  const capNhatNguoiDung = useCallback((duLieuMoi: any) => {
    setNguoiDung(prev => prev ? { ...prev, ...duLieuMoi } : prev)
  }, [])

  const dangXuat = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh()
    if (refreshToken) {
      // Thu hoi refresh token phia server (khong chan neu loi)
      api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    tokenStore.clear()
    setNguoiDung(null)
  }, [])

  return (
    <AuthContext.Provider value={{ nguoiDung, dangTai, dangNhap, dangXuat, capNhatNguoiDung }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider')
  return ctx
}
