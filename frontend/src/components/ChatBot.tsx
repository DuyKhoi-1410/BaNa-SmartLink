import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { tokenStore } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

interface TinNhan {
  id: number
  noiDung: string
  nguoiGui: 'user' | 'bot'
  thoiGian: Date
}

const cacGoiY = [
  'Làm sao để kê khai?',
  'Hạn kê khai khi nào?',
  'Tổng hộ nghèo toàn xã?',
  'Liên hệ hỗ trợ',
]

export default function ChatBot() {
  const { nguoiDung } = useAuth()
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
  const [dangXuLy, setDangXuLy] = useState(false)
  const cuoiTinRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cuoiTinRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tinNhan, dangXuLy])

  useEffect(() => {
    if (moChat) inputRef.current?.focus()
  }, [moChat])

  const buildLichSu = useCallback(() => {
    return tinNhan
      .filter(t => t.id !== 1)
      .slice(-6)
      .map(t => ({
        role: t.nguoiGui === 'user' ? 'user' : 'bot',
        content: t.noiDung,
      }))
  }, [tinNhan])

  const guiTinNhan = async (noiDung: string) => {
    if (!noiDung.trim() || dangXuLy) return

    const tinUser: TinNhan = {
      id: Date.now(),
      noiDung: noiDung.trim(),
      nguoiGui: 'user',
      thoiGian: new Date(),
    }
    setTinNhan(prev => [...prev, tinUser])
    setNoiDungNhap('')
    setDangXuLy(true)

    const botId = Date.now() + 1
    setTinNhan(prev => [...prev, {
      id: botId,
      noiDung: '',
      nguoiGui: 'bot',
      thoiGian: new Date(),
    }])

    try {
      const token = tokenStore.getAccess()
      const res = await fetch(`${API_BASE}/rag/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cauHoi: noiDung.trim(),
          lichSu: buildLichSu(),
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const json = JSON.parse(line.slice(6))
            if (json.token) {
              setTinNhan(prev => prev.map(t =>
                t.id === botId ? { ...t, noiDung: t.noiDung + json.token } : t
              ))
            }
          } catch {}
        }
      }

      setTinNhan(prev => {
        const bot = prev.find(t => t.id === botId)
        if (bot && !bot.noiDung) {
          return prev.map(t =>
            t.id === botId ? { ...t, noiDung: 'Xin lỗi, tôi không thể trả lời lúc này.' } : t
          )
        }
        return prev
      })
    } catch (err: any) {
      console.error('Chatbot error:', err)
      setTinNhan(prev => prev.map(t =>
        t.id === botId ? { ...t, noiDung: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' } : t
      ))
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
                  {(tn.nguoiGui === 'bot' && dangXuLy && !tn.noiDung) ? (
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`px-3.5 py-2.5 text-sm leading-relaxed
                          ${tn.nguoiGui === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-md whitespace-pre-wrap'
                            : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm chatbot-md'
                          }`}
                      >
                        {tn.nguoiGui === 'bot'
                          ? <ReactMarkdown>{tn.noiDung}</ReactMarkdown>
                          : tn.noiDung
                        }
                      </div>
                      <p className={`text-[10px] mt-1 ${tn.nguoiGui === 'user' ? 'text-right' : 'text-left'} text-slate-400`}>
                        {formatGio(tn.thoiGian)}
                      </p>
                    </>
                  )}
                </div>
                {tn.nguoiGui === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}

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
                disabled={dangXuLy}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!noiDungNhap.trim() || dangXuLy}
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
