import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { User, Edit3, Lock, Monitor, Link2, FileText, HelpCircle, BookOpen, Camera, ChevronDown } from 'lucide-react'

const nhomTaiKhoan = [
  { ten: 'Thông tin của bạn', duongDan: 'thong-tin', icon: User },
  { ten: 'Chỉnh sửa thông tin', duongDan: 'chinh-sua', icon: Edit3 },
  { ten: 'Thay đổi mật khẩu', duongDan: 'doi-mat-khau', icon: Lock },
  { ten: 'Quản lý thiết bị', duongDan: 'quan-ly-thiet-bi', icon: Monitor },
  { ten: 'Xác thực tài khoản', duongDan: 'phuong-thuc-dang-nhap', icon: Link2 },
]

const nhomHoTro = [
  { ten: 'Câu hỏi thường gặp', duongDan: 'cau-hoi', icon: HelpCircle },
  { ten: 'Hướng dẫn sử dụng', duongDan: 'huong-dan', icon: BookOpen },
  { ten: 'Điều khoản & Chính sách', duongDan: 'dieu-khoan', icon: FileText },
]

export default function CaiDatXa() {
  const location = useLocation()
  const laTrangGoc = location.pathname === '/xa/cai-dat' || location.pathname === '/xa/cai-dat/'
  const [moSidebar, setMoSidebar] = useState(false)
  const tkRef = useRef(null)
  const htRef = useRef(null)
  const [tkSlider, setTkSlider] = useState({})
  const [htSlider, setHtSlider] = useState({})

  useEffect(() => {
    const updateSlider = (ref, setSlider) => {
      const container = ref.current
      if (!container) return
      const activeLink = container.querySelector('.sidebar-active')
      if (activeLink) {
        setSlider({ top: activeLink.offsetTop, height: activeLink.offsetHeight })
      } else {
        setSlider({})
      }
    }
    updateSlider(tkRef, setTkSlider)
    updateSlider(htRef, setHtSlider)
  }, [location.pathname])

  if (laTrangGoc) {
    return <Navigate to="thong-tin" replace />
  }

  const tenTrangHienTai = [...nhomTaiKhoan, ...nhomHoTro].find(
    m => location.pathname.includes(m.duongDan)
  )?.ten || 'Cài đặt'

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Nút mở sidebar trên mobile */}
      <button
        onClick={() => setMoSidebar(!moSidebar)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 mb-4 bg-white rounded-xl border border-slate-200 shadow-sm"
      >
        <span className="text-sm font-semibold text-slate-700">{tenTrangHienTai}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${moSidebar ? 'rotate-180' : ''}`} />
      </button>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar trái */}
        <div className={`${moSidebar ? 'block' : 'hidden'} md:block w-full md:w-72 md:flex-shrink-0`}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Banner */}
            <div className="h-20 md:h-28 bg-gradient-to-r from-blue-500 to-indigo-500 relative" />

            {/* Avatar + Tên */}
            <div className="flex flex-col items-center -mt-10 md:-mt-12 pb-5 md:pb-6 px-5">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl md:text-2xl font-bold">CBX</span>
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-blue-600 transition-colors">
                  <Camera size={13} className="text-white" />
                </button>
              </div>
              <h3 className="mt-3 text-base md:text-lg font-bold text-slate-800">Cán bộ xã</h3>
              <p className="text-xs md:text-sm text-slate-500">Cán bộ xã · Xã Bà Nà</p>
            </div>

            {/* Nhóm Tài khoản */}
            <div className="px-3 pb-2">
              <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tài khoản</p>
              <div ref={tkRef} className="relative space-y-1">
                {tkSlider.height && (
                  <div
                    className="absolute left-0 w-full bg-blue-50 rounded-xl shadow-sm border border-blue-200 transition-all duration-300 ease-out"
                    style={{ top: tkSlider.top, height: tkSlider.height }}
                  />
                )}
                {nhomTaiKhoan.map((muc) => (
                  <NavLink
                    key={muc.duongDan}
                    to={muc.duongDan}
                    onClick={() => setMoSidebar(false)}
                    className={({ isActive }) =>
                      `relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
                      ${isActive
                        ? 'text-blue-700 sidebar-active'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`
                    }
                  >
                    <muc.icon size={18} />
                    {muc.ten}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="mx-5 border-t border-slate-200" />

            {/* Nhóm Hỗ trợ */}
            <div className="px-3 pt-2 pb-4">
              <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hỗ trợ</p>
              <div ref={htRef} className="relative space-y-1">
                {htSlider.height && (
                  <div
                    className="absolute left-0 w-full bg-blue-50 rounded-xl shadow-sm border border-blue-200 transition-all duration-300 ease-out"
                    style={{ top: htSlider.top, height: htSlider.height }}
                  />
                )}
                {nhomHoTro.map((muc) => (
                  <NavLink
                    key={muc.duongDan}
                    to={muc.duongDan}
                    onClick={() => setMoSidebar(false)}
                    className={({ isActive }) =>
                      `relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
                      ${isActive
                        ? 'text-blue-700 sidebar-active'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`
                    }
                  >
                    <muc.icon size={18} />
                    {muc.ten}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung bên phải */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
