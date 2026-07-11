import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [nguoiDung, setNguoiDung] = useState(null)
  const [dangTai, setDangTai] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setDangTai(false)
      return
    }
    api.get('/auth/me')
      .then(res => setNguoiDung(res.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setDangTai(false))
  }, [])

  const dangNhap = useCallback((token, user) => {
    localStorage.setItem('token', token)
    setNguoiDung(user)
  }, [])

  const dangXuat = useCallback(() => {
    localStorage.removeItem('token')
    setNguoiDung(null)
  }, [])

  return (
    <AuthContext.Provider value={{ nguoiDung, dangTai, dangNhap, dangXuat }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phai dung trong AuthProvider')
  return ctx
}
