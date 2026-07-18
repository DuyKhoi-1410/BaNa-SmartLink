import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, ChevronDown } from 'lucide-react'

interface TinNhan {
  id: number
  noiDung: string
  nguoiGui: 'user' | 'bot'
  thoiGian: Date
}

const cacGoiY = [
  'Làm sao để kê khai?',
  'Hạn kê khai khi nào?',
  'Cách xem lịch sử kê khai?',
  'Liên hệ hỗ trợ',
]

export default function ChatBot() {
  const [moChat, setMoChat] = useState(false)
  const [tinNhan, setTinNhan] = useState<TinNhan[]>([
    {
      id: 1,
      noiDung: 'Xin chào! Tôi là trợ lý SmartLink AI 🤖\nBạn cần hỗ trợ gì về kê khai hoặc sử dụng hệ thống?',
      nguoiGui: 'bot',
      thoiGian: new Date(),
    },
  ])
  const [noiDungNhap, setNoiDungNhap] = useState('')
  const [dangGoiY, setDangGoiY] = useState(false)
  const cuoiTinRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cuoiTinRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tinNhan, dangGoiY])

  useEffect(() => {
    if (moChat) inputRef.current?.focus()
  }, [moChat])

  const guiTinNhan = (noiDung: string) => {
    if (!noiDung.trim()) return

    const tinUser: TinNhan = {
      id: Date.now(),
      noiDung: noiDung.trim(),
      nguoiGui: 'user',
      thoiGian: new Date(),
    }
    setTinNhan(prev => [...prev, tinUser])
    setNoiDungNhap('')
    setDangGoiY(true)

    // Mock bot response
    setTimeout(() => {
      const tinBot: TinNhan = {
        id: Date.now() + 1,
        noiDung: taoTraLoiMock(noiDung),
        nguoiGui: 'bot',
        thoiGian: new Date(),
      }
      setTinNhan(prev => [...prev, tinBot])
      setDangGoiY(false)
    }, 1200)
  }

  const xuLyGui = (e: React.FormEvent) => {
    e.preventDefault()
    guiTinNhan(noiDungNhap)
  }

  const formatGio = (d: Date) =>
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setMoChat(!moChat)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer
          ${moChat
            ? 'bg-slate-600 hover:bg-slate-700 rotate-90 scale-90'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1'
          }`}
      >
        {moChat ? <X size={22} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </button>

      {/* Chat Panel */}
      {moChat && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn
          max-md:bottom-0 max-md:right-0 max-md:w-full max-md:max-w-full max-md:h-full max-md:max-h-full max-md:rounded-none">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">SmartLink AI</h3>
              <p className="text-white/70 text-xs">Trợ lý hỗ trợ kê khai</p>
            </div>
            <button
              onClick={() => setMoChat(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
            {tinNhan.map(tn => (
              <div key={tn.id} className={`flex gap-2 ${tn.nguoiGui === 'user' ? 'justify-end' : 'justify-start'}`}>
                {tn.nguoiGui === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${tn.nguoiGui === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                      ${tn.nguoiGui === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm'
                      }`}
                  >
                    {tn.noiDung}
                  </div>
                  <p className={`text-[10px] mt-1 ${tn.nguoiGui === 'user' ? 'text-right' : 'text-left'} text-slate-400`}>
                    {formatGio(tn.thoiGian)}
                  </p>
                </div>
                {tn.nguoiGui === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {dangGoiY && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={cuoiTinRef} />
          </div>

          {/* Quick suggestions */}
          {tinNhan.length <= 1 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-white flex-shrink-0">
              <p className="text-xs text-slate-400 mb-1.5">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-1.5">
                {cacGoiY.map(gy => (
                  <button
                    key={gy}
                    onClick={() => guiTinNhan(gy)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100"
                  >
                    {gy}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={xuLyGui} className="px-3 py-3 border-t border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={noiDungNhap}
                onChange={e => setNoiDungNhap(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!noiDungNhap.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white transition-all cursor-pointer
                  hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function taoTraLoiMock(cauHoi: string): string {
  const ch = cauHoi.toLowerCase()
  if (ch.includes('kê khai'))
    return 'Để kê khai, bạn vào mục "Kê Khai" trên thanh menu, bấm "Bắt đầu kê khai" và điền thông tin theo từng bước hướng dẫn.\n\nNếu là đợt kê khai tiếp theo, dữ liệu cũ sẽ được giữ sẵn để bạn chỉ cần xác nhận hoặc chỉnh sửa.'
  if (ch.includes('hạn') || ch.includes('thời gian'))
    return 'Thời hạn kê khai do xã quy định cho từng đợt. Bạn có thể xem hạn cụ thể tại trang "Kê Khai" hoặc trong mục "Thông Báo".'
  if (ch.includes('lịch sử'))
    return 'Bạn vào mục "Lịch Sử" trên thanh menu để xem lại tất cả các lần kê khai trước đó, bao gồm trạng thái duyệt và nội dung đã kê khai.'
  if (ch.includes('liên hệ') || ch.includes('hỗ trợ'))
    return 'Bạn có thể liên hệ cán bộ thôn hoặc gọi đường dây hỗ trợ: 0236 3846 789.\n\nHoặc đến trực tiếp UBND xã để được hỗ trợ.'
  if (ch.includes('mật khẩu'))
    return 'Để đổi mật khẩu, vào "Cài Đặt" → "Đổi mật khẩu". Nếu quên mật khẩu, liên hệ cán bộ thôn để được cấp lại.'
  return 'Cảm ơn câu hỏi của bạn! Hiện tại tôi đang được nâng cấp để trả lời chính xác hơn. Bạn có thể thử hỏi về:\n• Cách kê khai\n• Thời hạn kê khai\n• Lịch sử kê khai\n• Liên hệ hỗ trợ'
}
