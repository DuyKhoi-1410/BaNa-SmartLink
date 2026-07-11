import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Agentation } from 'agentation'
import LayoutDan from './components/LayoutDan'
import LayoutXa from './components/LayoutXa'
import LayoutThon from './components/LayoutThon'
import ManHinhTai from './components/ManHinhTai'
import { NhiemVuProvider } from './context/NhiemVuContext'
import { AuthProvider } from './context/AuthContext'

const TrangDangNhap = lazy(() => import('./pages/TrangDangNhap'))

const TrangChuDan = lazy(() => import('./pages/dan/TrangChuDan'))
const KeKhai = lazy(() => import('./pages/dan/KeKhai'))
const LichSu = lazy(() => import('./pages/dan/LichSu'))
const ThongBaoDan = lazy(() => import('./pages/dan/ThongBaoDan'))
const CaiDat = lazy(() => import('./pages/dan/CaiDat'))
const ThongTinCuaBanDan = lazy(() => import('./pages/dan/caidat/ThongTinCuaBan'))
const ChinhSuaThongTinDan = lazy(() => import('./pages/dan/caidat/ChinhSuaThongTin'))
const DoiMatKhauDan = lazy(() => import('./pages/dan/caidat/DoiMatKhau'))
const QuanLyThietBiDan = lazy(() => import('./pages/dan/caidat/QuanLyThietBi'))
const DieuKhoanChinhSachDan = lazy(() => import('./pages/dan/caidat/DieuKhoanChinhSach'))
const CauHoiThuongGapDan = lazy(() => import('./pages/dan/caidat/CauHoiThuongGap'))
const HuongDanSuDungDan = lazy(() => import('./pages/dan/caidat/HuongDanSuDung'))

const TrangChuXa = lazy(() => import('./pages/xa/TrangChuXa'))
const ThongBaoXa = lazy(() => import('./pages/xa/ThongBaoXa'))
const NhiemVuBaoCao = lazy(() => import('./pages/xa/NhiemVuBaoCao'))
const CaiDatXa = lazy(() => import('./pages/xa/CaiDatXa'))
const ThongTinCuaBanXa = lazy(() => import('./pages/xa/caidat/ThongTinCuaBan'))
const ChinhSuaThongTinXa = lazy(() => import('./pages/xa/caidat/ChinhSuaThongTin'))
const DoiMatKhauXa = lazy(() => import('./pages/xa/caidat/DoiMatKhau'))
const QuanLyThietBiXa = lazy(() => import('./pages/xa/caidat/QuanLyThietBi'))
const XacThucTaiKhoanXa = lazy(() => import('./pages/xa/caidat/XacThucTaiKhoan'))
const DieuKhoanChinhSachXa = lazy(() => import('./pages/xa/caidat/DieuKhoanChinhSach'))
const CauHoiThuongGapXa = lazy(() => import('./pages/xa/caidat/CauHoiThuongGap'))
const HuongDanSuDungXa = lazy(() => import('./pages/xa/caidat/HuongDanSuDung'))
const QuanLyHoDan = lazy(() => import('./pages/xa/QuanLyHoDan'))

const TrangChuThon = lazy(() => import('./pages/thon/TrangChuThon'))
const ThongBaoThon = lazy(() => import('./pages/thon/ThongBaoThon'))
const NhiemVuThon = lazy(() => import('./pages/thon/NhiemVuThon'))
const CaiDatThon = lazy(() => import('./pages/thon/CaiDatThon'))
const ThongTinCuaBanThon = lazy(() => import('./pages/thon/caidat/ThongTinCuaBan'))
const ChinhSuaThongTinThon = lazy(() => import('./pages/thon/caidat/ChinhSuaThongTin'))
const DoiMatKhauThon = lazy(() => import('./pages/thon/caidat/DoiMatKhau'))
const QuanLyThietBiThon = lazy(() => import('./pages/thon/caidat/QuanLyThietBi'))
const XacThucTaiKhoanThon = lazy(() => import('./pages/thon/caidat/XacThucTaiKhoan'))
const DieuKhoanChinhSachThon = lazy(() => import('./pages/thon/caidat/DieuKhoanChinhSach'))
const CauHoiThuongGapThon = lazy(() => import('./pages/thon/caidat/CauHoiThuongGap'))
const HuongDanSuDungThon = lazy(() => import('./pages/thon/caidat/HuongDanSuDung'))

function App() {
  return (
    <BrowserRouter>
      {import.meta.env.DEV && <Agentation />}
      <AuthProvider>
      <NhiemVuProvider>
      <Suspense fallback={<ManHinhTai />}>
        <Routes>
          <Route path="/" element={<TrangDangNhap />} />
          <Route path="/dan" element={<LayoutDan />}>
            <Route index element={<TrangChuDan />} />
            <Route path="ke-khai" element={<KeKhai />} />
            <Route path="lich-su" element={<LichSu />} />
            <Route path="thong-bao" element={<ThongBaoDan />} />
            <Route path="cai-dat" element={<CaiDat />}>
              <Route path="thong-tin" element={<ThongTinCuaBanDan />} />
              <Route path="chinh-sua" element={<ChinhSuaThongTinDan />} />
              <Route path="doi-mat-khau" element={<DoiMatKhauDan />} />
              <Route path="quan-ly-thiet-bi" element={<QuanLyThietBiDan />} />
              <Route path="dieu-khoan" element={<DieuKhoanChinhSachDan />} />
              <Route path="cau-hoi" element={<CauHoiThuongGapDan />} />
              <Route path="huong-dan" element={<HuongDanSuDungDan />} />
            </Route>
          </Route>
          <Route path="/xa" element={<LayoutXa />}>
            <Route index element={<TrangChuXa />} />
            <Route path="nhiem-vu-bao-cao" element={<NhiemVuBaoCao />} />
            <Route path="quan-ly-ho-dan" element={<QuanLyHoDan />} />
            <Route path="thong-bao" element={<ThongBaoXa />} />
            <Route path="cai-dat" element={<CaiDatXa />}>
              <Route path="thong-tin" element={<ThongTinCuaBanXa />} />
              <Route path="chinh-sua" element={<ChinhSuaThongTinXa />} />
              <Route path="doi-mat-khau" element={<DoiMatKhauXa />} />
              <Route path="quan-ly-thiet-bi" element={<QuanLyThietBiXa />} />
              <Route path="phuong-thuc-dang-nhap" element={<XacThucTaiKhoanXa />} />
              <Route path="dieu-khoan" element={<DieuKhoanChinhSachXa />} />
              <Route path="cau-hoi" element={<CauHoiThuongGapXa />} />
              <Route path="huong-dan" element={<HuongDanSuDungXa />} />
            </Route>
          </Route>
          <Route path="/thon" element={<LayoutThon />}>
            <Route index element={<TrangChuThon />} />
            <Route path="thong-bao" element={<ThongBaoThon />} />
            <Route path="nhiem-vu" element={<NhiemVuThon />} />
            <Route path="cai-dat" element={<CaiDatThon />}>
              <Route path="thong-tin" element={<ThongTinCuaBanThon />} />
              <Route path="chinh-sua" element={<ChinhSuaThongTinThon />} />
              <Route path="doi-mat-khau" element={<DoiMatKhauThon />} />
              <Route path="quan-ly-thiet-bi" element={<QuanLyThietBiThon />} />
              <Route path="phuong-thuc-dang-nhap" element={<XacThucTaiKhoanThon />} />
              <Route path="dieu-khoan" element={<DieuKhoanChinhSachThon />} />
              <Route path="cau-hoi" element={<CauHoiThuongGapThon />} />
              <Route path="huong-dan" element={<HuongDanSuDungThon />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      </NhiemVuProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
