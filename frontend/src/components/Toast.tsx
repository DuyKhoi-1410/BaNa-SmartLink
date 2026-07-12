import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ hien, noiDung, thoiGian = 3000, dongToast }) {
  const [dangHien, setDangHien] = useState(false)

  useEffect(() => {
    if (!hien) { setDangHien(false); return }
    setDangHien(true)
    const timer = setTimeout(() => {
      setDangHien(false)
      setTimeout(() => dongToast?.(), 300)
    }, thoiGian)
    return () => clearTimeout(timer)
  }, [hien, thoiGian, dongToast])

  if (!hien && !dangHien) return null

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${
      dangHien ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div className="flex items-center gap-3 px-5 py-3 bg-white border border-emerald-200 rounded-xl shadow-lg shadow-emerald-500/10">
        <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-700">{noiDung}</span>
        <button onClick={() => { setDangHien(false); setTimeout(() => dongToast?.(), 300) }} className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ml-1">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
