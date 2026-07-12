import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ManHinhTai from './ManHinhTai'

// Bao ve route theo vai tro. Chua dang nhap -> ve trang dang nhap.
// Sai vai tro -> ve dung khu vuc cua minh.
export default function ProtectedRoute({ vaiTro, children }: { vaiTro: 'dan' | 'thon' | 'xa'; children: React.ReactNode }) {
  const { nguoiDung, dangTai } = useAuth()

  if (dangTai) return <ManHinhTai />
  if (!nguoiDung) return <Navigate to="/" replace />
  if (nguoiDung.vai_tro !== vaiTro) {
    // Dieu huong ve khu vuc dung voi vai tro
    const dich = nguoiDung.vai_tro === 'xa' ? '/xa' : nguoiDung.vai_tro === 'thon' ? '/thon' : '/dan'
    return <Navigate to={dich} replace />
  }
  return <>{children}</>
}
