import { useState } from 'react'
import { Monitor, Smartphone, Tablet, LogOut, Shield } from 'lucide-react'

const danhSachThietBi = [
  {
    id: 1,
    ten: 'Windows PC — Chrome',
    loai: 'desktop',
    diaChi: 'Đà Nẵng, Việt Nam',
    thoiGian: 'Đang hoạt động',
    laDangNhapHienTai: true,
  },
  {
    id: 2,
    ten: 'iPhone 14 — Safari',
    loai: 'phone',
    diaChi: 'Đà Nẵng, Việt Nam',
    thoiGian: '2 giờ trước',
    laDangNhapHienTai: false,
  },
  {
    id: 3,
    ten: 'iPad Air — Chrome',
    loai: 'tablet',
    diaChi: 'Hòa Vang, Đà Nẵng',
    thoiGian: '3 ngày trước',
    laDangNhapHienTai: false,
  },
]

const layIcon = (loai) => {
  switch (loai) {
    case 'phone': return Smartphone
    case 'tablet': return Tablet
    default: return Monitor
  }
}

export default function QuanLyThietBi() {
  const [thietBis, setThietBis] = useState(danhSachThietBi)

  const dangXuatThietBi = (id) => {
    setThietBis(thietBis.filter((tb) => tb.id !== id))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Quản Lý Thiết Bị</h1>
        <p className="text-slate-500 mt-1">Các thiết bị đang đăng nhập vào tài khoản của bạn</p>
      </div>

      <div className="p-8">
        <div className="space-y-4">
          {thietBis.map((tb) => {
            const Icon = layIcon(tb.loai)
            return (
              <div
                key={tb.id}
                className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${tb.laDangNhapHienTai ? 'bg-blue-50' : 'bg-slate-50'}`}
                >
                  <Icon size={22} className={tb.laDangNhapHienTai ? 'text-blue-600' : 'text-slate-500'} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">{tb.ten}</p>
                    {tb.laDangNhapHienTai && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <Shield size={12} />
                        Thiết bị này
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {tb.diaChi} · {tb.thoiGian}
                  </p>
                </div>

                {!tb.laDangNhapHienTai && (
                  <button
                    onClick={() => dangXuatThietBi(tb.id)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl text-sm font-medium
                      hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-md
                      active:translate-y-0 active:scale-[0.98]
                      transition-all duration-300"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {thietBis.length > 1 && (
          <button
            onClick={() => setThietBis(thietBis.filter((tb) => tb.laDangNhapHienTai))}
            className="mt-6 flex items-center gap-2 px-5 py-3 text-red-600 border border-red-200 rounded-xl text-sm font-medium
              hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-md
              active:translate-y-0 active:scale-[0.98]
              transition-all duration-300"
          >
            <LogOut size={16} />
            Đăng xuất tất cả thiết bị khác
          </button>
        )}
      </div>
    </div>
  )
}
