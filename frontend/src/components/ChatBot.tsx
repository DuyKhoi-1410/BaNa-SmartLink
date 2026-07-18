import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, ChevronDown, BookOpen, Database } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

interface TinNhan {
  id: number
  noiDung: string
  nguoiGui: 'user' | 'bot'
  thoiGian: Date
  loai?: 'huong_dan' | 'so_lieu'
}

const cacGoiYHuongDan = [
  'Làm sao để kê khai?',
  'Hạn kê khai khi nào?',
  'Cách xem lịch sử kê khai?',
  'Liên hệ hỗ trợ',
]

const cacGoiYSoLieu = [
  'Tổng hộ nghèo toàn xã?',
  'Số nhân khẩu theo từng thôn?',
  'Thôn nào có nhiều trẻ dưới 16 nhất?',
  'Tổng hộ cận nghèo đợt mới nhất?',
]

export default function ChatBot() {
  const { nguoiDung } = useAuth()
  const laXa = nguoiDung?.vai_tro === 'xa'

  const [moChat, setMoChat] = useState(false)
  const [cheDoSoLieu, setCheDoSoLieu] = useState(false)
  const [tinNhan, setTinNhan] = useState<TinNhan[]>([
    {
      id: 1,
      noiDung: 'Xin chào! Tôi là trợ lý SmartLink AI 🤖\nBạn cần hỗ trợ gì về kê khai hoặc sử dụng hệ thống?',
      nguoiGui: 'bot',
      thoiGian: new Date(),
    },
  ])
  const [noiDungNhap, setNoiDungNhap] = useState('')
  const [dangXuLy, setDangXuLy] = useState(false)
  const cuoiTinRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cuoiTinRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tinNhan, dangXuLy])

  useEffect(() => {
    if (moChat) inputRef.current?.focus()
  }, [moChat])

  const guiTinNhan = async (noiDung: string) => {
    if (!noiDung.trim() || dangXuLy) return

    const dangHoiSoLieu = laXa && cheDoSoLieu

    const tinUser: TinNhan = {
      id: Date.now(),
      noiDung: noiDung.trim(),
      nguoiGui: 'user',
      thoiGian: new Date(),
      loai: dangHoiSoLieu ? 'so_lieu' : 'huong_dan',
    }
    setTinNhan(prev => [...prev, tinUser])
    setNoiDungNhap('')
    setDangXuLy(true)

    try {
      const endpoint = dangHoiSoLieu ? '/rag/ask-data' : '/rag/ask'
      const res = await api.post<{ answer: string }>(endpoint, { cauHoi: noiDung.trim() })
      const traLoi = res.answer || 'Xin lỗi, tôi không thể trả lời lúc này.'
      setTinNhan(prev => [...prev, {
        id: Date.now() + 1,
        noiDung: traLoi,
        nguoiGui: 'bot',
        thoiGian: new Date(),
        loai: dangHoiSoLieu ? 'so_lieu' : 'huong_dan',
      }])
    } catch {
      setTinNhan(prev => [...prev, {
        id: Date.now() + 1,
        noiDung: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        nguoiGui: 'bot',
        thoiGian: new Date(),
      }])
    } finally {
      setDangXuLy(false)
    }
  }

  const xuLyGui = (e: React.FormEvent) => {
    e.preventDefault()
    guiTinNhan(noiDungNhap)
  }

  const formatGio = (d: Date) =>
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const cacGoiY = (laXa && cheDoSoLieu) ? cacGoiYSoLieu : cacGoiYHuongDan

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
              <p className="text-white/70 text-xs">
                {laXa && cheDoSoLieu ? 'Truy vấn số liệu' : 'Trợ lý hỗ trợ kê khai'}
              </p>
            </div>
            <button
              onClick={() => setMoChat(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Mode toggle - chỉ hiện cho Xã */}
          {laXa && (
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => setCheDoSoLieu(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                  ${!cheDoSoLieu
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                <BookOpen size={13} />
                Hướng dẫn
              </button>
              <button
                onClick={() => setCheDoSoLieu(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                  ${cheDoSoLieu
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                <Database size={13} />
                Số liệu
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
            {tinNhan.map(tn => (
              <div key={tn.id} className={`flex gap-2 ${tn.nguoiGui === 'user' ? 'justify-end' : 'justify-start'}`}>
                {tn.nguoiGui === 'bot' && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                    ${tn.loai === 'so_lieu'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                    }`}>
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${tn.nguoiGui === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                      ${tn.nguoiGui === 'user'
                        ? tn.loai === 'so_lieu'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl rounded-br-md'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm'
                      }`}
                  >
                    {tn.noiDung}
                  </div>
                  <p className={`text-[10px] mt-1 ${tn.nguoiGui === 'user' ? 'text-right' : 'text-left'} text-slate-400`}>
                    {formatGio(tn.thoiGian)}
                    {tn.loai === 'so_lieu' && tn.nguoiGui === 'bot' && (
                      <span className="ml-1 text-emerald-400">• Số liệu</span>
                    )}
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
            {dangXuLy && (
              <div className="flex gap-2 items-start">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                  ${cheDoSoLieu && laXa
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  }`}>
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
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors cursor-pointer border
                      ${laXa && cheDoSoLieu
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100'
                      }`}
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
                placeholder={laXa && cheDoSoLieu ? 'Hỏi số liệu...' : 'Nhập câu hỏi...'}
                disabled={dangXuLy}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!noiDungNhap.trim() || dangXuLy}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer
                  hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                  ${laXa && cheDoSoLieu
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-blue-500/30'
                  }`}
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
