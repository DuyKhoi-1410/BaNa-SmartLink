import { MapPin, Phone, Mail, Clock, ExternalLink, ArrowUp, Globe } from 'lucide-react'
import logoIcon from '../assets/LOGO.png'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white rounded-full" />
      </div>

      {/* Nút quay lên */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute -top-4 right-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30
            text-white hover:bg-blue-400 hover:-translate-y-0.5 transition-all active:scale-95 z-10"
        >
          <ArrowUp size={15} />
        </button>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-5">
        {/* Top: 3 cột */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Cột 1: Logo + Giới thiệu */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src={logoIcon} alt="Logo Ba Na" className="h-9 object-contain" loading="lazy" />
              <div>
                <h3 className="font-bold text-sm leading-tight">Ba Na SmartLink</h3>
                <p className="text-white/40 text-[11px]">Nền tảng số hóa báo cáo xã — thôn</p>
              </div>
            </div>
            <p className="text-white/55 text-xs leading-relaxed mb-3">
              Hệ thống kê khai và báo cáo số liệu trực tuyến, kết nối người dân — thôn — xã trên địa bàn xã Bà Nà.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center hover:bg-white/20 transition-colors" title="Zalo">
                <span className="text-[11px] font-bold">Z</span>
              </a>
              <a href="#" className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center hover:bg-white/20 transition-colors" title="Facebook">
                <span className="text-[11px] font-bold">f</span>
              </a>
              <a href="https://bana.danang.gov.vn/" target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center hover:bg-white/20 transition-colors" title="Website">
                <Globe size={13} />
              </a>
            </div>
          </div>

          {/* Cột 2: Liên hệ */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Liên hệ</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-white/70">
                <MapPin size={13} className="text-blue-400 mt-0.5 shrink-0" />
                <span>UBND xã Bà Nà, huyện Hòa Vang, TP. Đà Nẵng</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Phone size={13} className="text-blue-400 shrink-0" />
                <span>0236 3846 789</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Mail size={13} className="text-blue-400 shrink-0" />
                <span>ubnd.bana@danang.gov.vn</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Clock size={13} className="text-blue-400 shrink-0" />
                <span>7:00 — 17:00 (Thứ 2 — Thứ 6)</span>
              </div>
            </div>
          </div>

          {/* Cột 3: Liên kết */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Liên kết</h4>
            <div className="space-y-2 text-xs">
              <a href="https://bana.danang.gov.vn/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/70 hover:text-blue-300 transition-colors">
                <ExternalLink size={11} className="shrink-0" /> Cổng thông tin điện tử xã Bà Nà
              </a>
              <a href="https://danang.gov.vn/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/70 hover:text-blue-300 transition-colors">
                <ExternalLink size={11} className="shrink-0" /> Cổng thông tin TP. Đà Nẵng
              </a>
              <a href="https://dichvucong.danang.gov.vn/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/70 hover:text-blue-300 transition-colors">
                <ExternalLink size={11} className="shrink-0" /> Dịch vụ công trực tuyến Đà Nẵng
              </a>
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mt-4 mb-2">Hỗ trợ</h4>
            <div className="space-y-2 text-xs">
              <a href="#" className="flex items-center gap-1.5 text-white/70 hover:text-blue-300 transition-colors">
                <ExternalLink size={11} className="shrink-0" /> Hướng dẫn sử dụng
              </a>
              <a href="#" className="flex items-center gap-1.5 text-white/70 hover:text-blue-300 transition-colors">
                <ExternalLink size={11} className="shrink-0" /> Câu hỏi thường gặp
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-5 pt-3 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="text-white/35 text-[11px]">
            © 2025 UBND Xã Bà Nà · Huyện Hòa Vang · TP. Đà Nẵng
          </p>
          <p className="text-white/25 text-[11px]">
            Phát triển bởi DUETECH AI
          </p>
        </div>
      </div>
    </footer>
  )
}
