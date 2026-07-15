import { MapPin, Phone, Mail, Clock, ExternalLink, ArrowUp, Globe } from 'lucide-react'
import logoIcon from '../assets/LOGO.png'
import logoChu from '../assets/CHỮ.PNG'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-500 text-white overflow-hidden">
      {/* Pattern trang trí */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Nút quay lên đầu trang */}
      <div className="relative max-w-7xl mx-auto px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute -top-5 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg
            text-indigo-500 hover:bg-indigo-50 hover:-translate-y-1 hover:shadow-xl
            transition-all duration-300 active:scale-95"
        >
          <ArrowUp size={20} />
        </button>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-8">
        {/* Logo + Tên lớn ở trên */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <img src={logoIcon} alt="Logo Ba Na" className="h-12 md:h-16 object-contain" />
          <div>
            <img src={logoChu} alt="Ba Na SmartLink" className="h-8 md:h-10 object-contain" />
            <p className="text-white/70 text-xs md:text-sm mt-0.5">Nền tảng số hóa báo cáo xã — thôn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cột 1: Giới thiệu + Mạng xã hội */}
          <div>
            <p className="text-white/80 text-sm leading-relaxed mb-5">
              Hệ thống kê khai và báo cáo số liệu trực tuyến, kết nối người dân — thôn — xã trên địa bàn xã Bà Nà.
            </p>
            {/* Mạng xã hội */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors" title="Zalo">
                <span className="text-sm font-bold">Z</span>
              </a>
              <a href="#" className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors" title="Facebook">
                <span className="text-sm font-bold">f</span>
              </a>
              <a href="https://bana.danang.gov.vn/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors" title="Trang web">
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Cột 2: Liên hệ */}
          <div>
            <h3 className="text-lg font-bold mb-5">Liên Hệ</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-medium">Ủy ban nhân dân xã Bà Nà</p>
                  <p className="text-white/70 mt-0.5">Xã Bà Nà, huyện Hòa Vang, TP. Đà Nẵng</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="font-medium">0236 3846 789</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="font-medium">ubnd.bana@danang.gov.vn</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium">7:00 — 17:00 (Thứ 2 — Thứ 6)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 3: Liên kết */}
          <div>
            <h3 className="text-lg font-bold mb-5">Liên Kết Hữu Ích</h3>
            <div className="space-y-3 text-sm">
              <a
                href="https://bana.danang.gov.vn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/85 hover:text-white transition-colors group"
              >
                <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                Cổng thông tin điện tử xã Bà Nà
              </a>
              <a
                href="https://danang.gov.vn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/85 hover:text-white transition-colors group"
              >
                <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                Cổng thông tin TP. Đà Nẵng
              </a>
              <a
                href="https://dichvucong.danang.gov.vn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/85 hover:text-white transition-colors group"
              >
                <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                Dịch vụ công trực tuyến Đà Nẵng
              </a>
            </div>

            <h3 className="text-lg font-bold mt-7 mb-4">Hỗ Trợ</h3>
            <div className="space-y-3 text-sm">
              <a href="#" className="flex items-center gap-2 text-white/85 hover:text-white transition-colors group">
                <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                Hướng dẫn sử dụng
              </a>
              <a href="#" className="flex items-center gap-2 text-white/85 hover:text-white transition-colors group">
                <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                Câu hỏi thường gặp
              </a>
            </div>
          </div>
        </div>

        {/* Đường kẻ + Copyright */}
        <div className="border-t border-white/25 mt-8 md:mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/60 text-xs md:text-sm text-center md:text-left">
            © 2025 UBND Xã Bà Nà · Huyện Hòa Vang · TP. Đà Nẵng
          </p>
          <p className="text-white/50 text-xs">
            Phát triển bởi DUETECH AI
          </p>
        </div>
      </div>
    </footer>
  )
}
