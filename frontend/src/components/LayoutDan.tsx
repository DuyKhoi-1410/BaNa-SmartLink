import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, FileText, Bell, HelpCircle, Settings, ChevronDown, User, LogOut, Search, X, BookOpen, Shield, History, Menu } from 'lucide-react'
import Footer from './Footer'
import logoIcon from '../assets/LOGO.png'
import logoChu from '../assets/CHỮ.PNG'
import { useAuth } from '../context/AuthContext'
import useThongBaoChuaDoc from '../hooks/useThongBaoChuaDoc'

const duLieuTimKiem = [
  { nhom: 'Câu hỏi thường gặp', icon: HelpCircle, mau: 'text-blue-600 bg-blue-50', duongDan: '/dan/cai-dat/cau-hoi', danhSach: [
    { tieuDe: 'Làm sao để bắt đầu kê khai?', moTa: 'Vào mục "Kê Khai" trên thanh menu, bấm "Bắt đầu kê khai" và điền thông tin theo hướng dẫn.' },
    { tieuDe: 'Tôi có thể sửa dữ liệu đã kê khai không?', moTa: 'Nếu đợt kê khai còn trong thời hạn và cán bộ thôn chưa duyệt, bạn có thể chỉnh sửa.' },
    { tieuDe: 'Kê khai có bắt buộc không?', moTa: 'Có. Mỗi hộ gia đình cần kê khai đầy đủ theo từng đợt do xã phát động.' },
    { tieuDe: 'Tôi quên mật khẩu thì phải làm sao?', moTa: 'Vào "Cài đặt" → "Thay đổi mật khẩu" hoặc liên hệ cán bộ thôn, gọi 0236 3846 789.' },
    { tieuDe: 'Dữ liệu của tôi có được bảo mật không?', moTa: 'Có. Dữ liệu được mã hóa và lưu trữ an toàn, chỉ cán bộ có thẩm quyền mới xem được.' },
    { tieuDe: 'Lần kê khai sau có phải nhập lại từ đầu không?', moTa: 'Không. Hệ thống giữ dữ liệu cũ, bạn chỉ cần xác nhận hoặc sửa.' },
    { tieuDe: 'Thông báo trên Zalo hoạt động như thế nào?', moTa: 'Hệ thống tự động gửi nhắc nhở qua Zalo OA khi có đợt kê khai mới hoặc gần hết hạn.' },
    { tieuDe: 'Tôi có thể đăng nhập trên nhiều thiết bị không?', moTa: 'Có. Vào "Quản lý thiết bị" trong Cài đặt để xem và quản lý.' },
  ]},
  { nhom: 'Hướng dẫn sử dụng', icon: BookOpen, mau: 'text-blue-600 bg-blue-50', duongDan: '/dan/cai-dat/huong-dan', danhSach: [
    { tieuDe: 'Đăng nhập vào hệ thống', moTa: 'Mở trình duyệt, nhập số điện thoại và mật khẩu đã được cấp.' },
    { tieuDe: 'Bắt đầu kê khai', moTa: 'Ở trang chủ, bấm vào mục "Kê Khai", bấm "Bắt đầu kê khai" để điền thông tin.' },
    { tieuDe: 'Điền thông tin từng bước', moTa: 'Hệ thống hướng dẫn điền theo từng chỉ tiêu. Lần sau dữ liệu cũ được giữ sẵn.' },
    { tieuDe: 'Gửi kê khai', moTa: 'Sau khi điền xong, kiểm tra lại và bấm "Gửi kê khai" để nộp cho cán bộ thôn.' },
    { tieuDe: 'Theo dõi thông báo', moTa: 'Vào mục "Thông Báo" để xem cập nhật: đợt kê khai mới, nhắc nhở, kết quả duyệt.' },
    { tieuDe: 'Quản lý tài khoản', moTa: 'Vào "Cài Đặt" để xem thông tin, đổi mật khẩu, quản lý thiết bị.' },
  ]},
  { nhom: 'Điều khoản sử dụng', icon: FileText, mau: 'text-purple-600 bg-purple-50', duongDan: '/dan/cai-dat/dieu-khoan', danhSach: [
    { tieuDe: 'Quyền và trách nhiệm người dùng', moTa: 'Cung cấp thông tin chính xác, bảo mật tài khoản, kê khai đúng hạn.' },
    { tieuDe: 'Quyền của hệ thống', moTa: 'Thu thập dữ liệu kê khai, gửi thông báo nhắc nhở, tạm khóa tài khoản vi phạm.' },
    { tieuDe: 'Giới hạn trách nhiệm', moTa: 'Hệ thống nỗ lực duy trì ổn định nhưng không chịu trách nhiệm cho sự cố ngoài tầm kiểm soát.' },
  ]},
  { nhom: 'Chính sách quyền riêng tư', icon: Shield, mau: 'text-green-600 bg-green-50', duongDan: '/dan/cai-dat/dieu-khoan', danhSach: [
    { tieuDe: 'Dữ liệu chúng tôi thu thập', moTa: 'Thông tin cá nhân, dữ liệu kê khai CT01-CT14, thông tin thiết bị và lịch sử đăng nhập.' },
    { tieuDe: 'Mục đích sử dụng dữ liệu', moTa: 'Phục vụ quy trình kê khai, gửi thông báo, phân tích tổng hợp cải thiện dịch vụ.' },
    { tieuDe: 'Bảo mật dữ liệu', moTa: 'Lưu trữ trên Supabase với mã hóa SSL. Chỉ cán bộ có thẩm quyền mới truy cập.' },
    { tieuDe: 'Quyền của người dùng', moTa: 'Xem và chỉnh sửa thông tin, yêu cầu xóa tài khoản, được thông báo khi thay đổi chính sách.' },
  ]},
]

const menuCoDinh: any[] = [
  { ten: 'Trang Chủ', duongDan: '/dan', icon: Home },
  { ten: 'Kê Khai', duongDan: '/dan/ke-khai', icon: FileText },
  { ten: 'Lịch Sử', duongDan: '/dan/lich-su', icon: History },
  { ten: 'Thông Báo', duongDan: '/dan/thong-bao', icon: Bell, laBadge: true },
  { ten: 'Cài Đặt', duongDan: '/dan/cai-dat', icon: Settings },
]

export default function LayoutDan() {
  const { nguoiDung, dangXuat } = useAuth()
  const soChuaDoc = useThongBaoChuaDoc()
  const [moDropdown, setMoDropdown] = useState(false)
  const [moMenu, setMoMenu] = useState(false)
  const [tuKhoa, setTuKhoa] = useState('')
  const [dangTimKiem, setDangTimKiem] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const danhSachMenu = menuCoDinh.map(muc =>
    muc.laBadge ? { ...muc, soBadge: soChuaDoc } : muc
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.key])

  useEffect(() => {
    const xuLyClickNgoai = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDangTimKiem(false)
      }
    }
    document.addEventListener('mousedown', xuLyClickNgoai)
    return () => document.removeEventListener('mousedown', xuLyClickNgoai)
  }, [])

  const ketQuaTimKiem = () => {
    if (!tuKhoa.trim()) return []
    const tu = tuKhoa.toLowerCase()
    return duLieuTimKiem.map((nhom) => ({
      ...nhom,
      danhSach: nhom.danhSach.filter(
        (m) => m.tieuDe.toLowerCase().includes(tu) || m.moTa.toLowerCase().includes(tu)
      ),
    })).filter((nhom) => nhom.danhSach.length > 0)
  }

  const bấmKetQua = (duongDan) => {
    setDangTimKiem(false)
    setTuKhoa('')
    navigate(duongDan)
  }

  const highlightTuKhoa = (text) => {
    if (!tuKhoa.trim()) return text
    const regex = new RegExp(`(${tuKhoa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-blue-200 text-blue-900 rounded px-0.5">{part}</mark> : part
    )
  }

  const ketQua = ketQuaTimKiem()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-14 md:h-16">
          {/* Logo + Tên */}
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => navigate('/dan')}>
            <img src={logoIcon} alt="Logo Ba Na" className="h-9 md:h-10 object-contain" />
            <img src={logoChu} alt="Ba Na SmartLink" className="h-6 md:h-7 object-contain" />
          </div>

          {/* Menu giữa + Thanh tìm kiếm (ẩn trên mobile) */}
          <div className="hidden lg:flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {danhSachMenu.map((muc) => (
                <NavLink
                  key={muc.duongDan}
                  to={muc.duongDan}
                  end={muc.duongDan === '/dan'}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(muc.duongDan)
                  }}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white/25 text-white shadow-sm'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                    }`
                  }
                >
                  <muc.icon size={18} />
                  {muc.ten}
                  {muc.soBadge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                      {muc.soBadge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Thanh tìm kiếm */}
            <div ref={searchRef} className="relative">
              <div className="flex items-center gap-2 w-44 bg-white/15 hover:bg-white/20 rounded-lg border border-transparent">
                <Search size={16} className="text-white/70 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  onFocus={() => setDangTimKiem(true)}
                  placeholder="Tìm kiếm hỗ trợ..."
                  className="w-full py-2 pr-3 bg-transparent text-white placeholder-white/50 text-sm focus:outline-none"
                />
                {tuKhoa && (
                  <button
                    onClick={() => { setTuKhoa(''); setDangTimKiem(false) }}
                    className="mr-2 text-white/60 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown kết quả */}
              {dangTimKiem && tuKhoa.trim() && (
                <div className="absolute right-0 top-full mt-2 w-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  {ketQua.length > 0 ? (
                    <div className="max-h-[420px] overflow-y-auto">
                      {ketQua.map((nhom, i) => (
                        <div key={i}>
                          <div className="sticky top-0 flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${nhom.mau}`}>
                              <nhom.icon size={14} />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{nhom.nhom}</span>
                            <span className="text-xs text-slate-400">({nhom.danhSach.length})</span>
                          </div>
                          {nhom.danhSach.map((muc, j) => (
                            <button
                              key={j}
                              onClick={() => bấmKetQua(nhom.duongDan)}
                              className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <p className="text-sm font-medium text-slate-800">{highlightTuKhoa(muc.tieuDe)}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{highlightTuKhoa(muc.moTa)}</p>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <Search size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">Không tìm thấy kết quả</p>
                      <p className="text-xs text-slate-400 mt-1">Thử từ khóa khác hoặc xem Câu hỏi thường gặp</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avatar + Dropdown (ẩn trên mobile) */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setMoDropdown(!moDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:bg-white/15 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center border border-white/30">
                <User className="text-white" size={18} />
              </div>
              <span className="text-sm font-medium">{nguoiDung?.ho_ten || 'Người dân'}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${moDropdown ? 'rotate-180' : ''}`} />
            </button>

            {moDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => { setMoDropdown(false); navigate('/dan/cai-dat/thong-tin') }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <User size={18} className="text-slate-400" />
                    Thông Tin Cá Nhân
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => { setMoDropdown(false); dangXuat(); navigate('/') }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={18} />
                    Đăng Xuất
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Nút hamburger (chỉ hiện trên mobile) */}
          <button
            onClick={() => setMoMenu(!moMenu)}
            className="lg:hidden p-2 rounded-lg text-white/90 hover:bg-white/15 transition-colors"
          >
            {moMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu mobile */}
        {moMenu && (
          <div className="lg:hidden border-t border-white/20">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {danhSachMenu.map((muc) => (
                <NavLink
                  key={muc.duongDan}
                  to={muc.duongDan}
                  end={muc.duongDan === '/dan'}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(muc.duongDan)
                    setMoMenu(false)
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white/25 text-white'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                    }`
                  }
                >
                  <muc.icon size={18} />
                  {muc.ten}
                  {muc.soBadge > 0 && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                      {muc.soBadge}
                    </span>
                  )}
                </NavLink>
              ))}

              {/* Tìm kiếm mobile */}
              <div ref={searchRef} className="relative mt-2">
                <div className="flex items-center gap-2 bg-white/15 rounded-lg">
                  <Search size={16} className="text-white/70 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={tuKhoa}
                    onChange={(e) => setTuKhoa(e.target.value)}
                    onFocus={() => setDangTimKiem(true)}
                    placeholder="Tìm kiếm hỗ trợ..."
                    className="w-full py-2.5 pr-3 bg-transparent text-white placeholder-white/50 text-sm focus:outline-none"
                  />
                  {tuKhoa && (
                    <button
                      onClick={() => { setTuKhoa(''); setDangTimKiem(false) }}
                      className="mr-2 text-white/60 hover:text-white transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {dangTimKiem && tuKhoa.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    {ketQua.length > 0 ? (
                      <div className="max-h-[320px] overflow-y-auto">
                        {ketQua.map((nhom, i) => (
                          <div key={i}>
                            <div className="sticky top-0 flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${nhom.mau}`}>
                                <nhom.icon size={14} />
                              </div>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{nhom.nhom}</span>
                            </div>
                            {nhom.danhSach.map((muc, j) => (
                              <button
                                key={j}
                                onClick={() => { bấmKetQua(nhom.duongDan); setMoMenu(false) }}
                                className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <p className="text-sm font-medium text-slate-800">{highlightTuKhoa(muc.tieuDe)}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{highlightTuKhoa(muc.moTa)}</p>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-6 text-center">
                        <Search size={28} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500 font-medium text-sm">Không tìm thấy kết quả</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tài khoản mobile */}
              <div className="border-t border-white/20 mt-2 pt-2 space-y-1">
                <button
                  onClick={() => { navigate('/dan/cai-dat/thong-tin'); setMoMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all"
                >
                  <User size={18} />
                  Thông Tin Cá Nhân
                </button>
                <button
                  onClick={() => { dangXuat(); navigate('/'); setMoMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-200 hover:bg-white/15 hover:text-red-100 transition-all"
                >
                  <LogOut size={18} />
                  Đăng Xuất
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Nội dung chính */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
