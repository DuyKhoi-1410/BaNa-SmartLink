export default function ManHinhTai() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fadeIn">
      {/* Header giả */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-56 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-80 bg-slate-100 rounded-md animate-pulse mt-2" />
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Card lớn giả */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-5 w-48 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-md animate-pulse mt-1.5" />
          </div>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Danh sách giả */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-64 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-3 w-44 bg-slate-100 rounded-md animate-pulse mt-2" />
            </div>
            <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
