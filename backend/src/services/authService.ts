import bcrypt from 'bcrypt'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import * as hoDanRepo from '../repositories/hoDanRepo.js'
import * as refreshTokenRepo from '../repositories/refreshTokenRepo.js'
import * as tokenService from './tokenService.js'

type Ctx = { ip?: string | null; userAgent?: string | null }

// Dan thuoc ho da "da_roi" thi khong duoc dang nhap
async function kiemTraHoConCuTru(user: any) {
  if (user.vai_tro !== 'dan') return
  const ho = await hoDanRepo.timTheoChuHo(user.id)
  if (ho && ho.trang_thai === 'da_roi') {
    throw { status: 403, message: 'Ho gia dinh da roi khoi dia phuong. Khong the dang nhap.' }
  }
}

export async function dangNhapDan(cccd: string, hoTen: string) {
  const user = await nguoiDungRepo.timTheoCccd(cccd)
  if (!user) throw { status: 404, message: 'Khong tim thay thong tin. Vui long kiem tra lai so CCCD.' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he can bo xa.' }
  if (user.ho_ten.toLowerCase().trim() !== hoTen.toLowerCase().trim()) {
    throw { status: 400, message: 'Ho ten khong khop voi so CCCD.' }
  }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Tai khoan nay khong phai nguoi dan.' }
  await kiemTraHoConCuTru(user)
  return user
}

export async function xacThucOtp(userId: number, ctx?: Ctx) {
  const user = await nguoiDungRepo.timTheoId(userId)
  if (!user) throw { status: 404, message: 'Khong tim thay nguoi dung' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he can bo xa.' }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Tai khoan nay khong phai nguoi dan.' }
  await kiemTraHoConCuTru(user)
  const tokens = await tokenService.taoCapToken(user, ctx)
  await nguoiDungRepo.capNhat(user.id, { lan_dang_nhap_cuoi: new Date() })
  return { ...tokens, user }
}

export async function dangNhapCanBo(tenDangNhap: string, matKhau: string, ctx?: Ctx) {
  const user = await nguoiDungRepo.timTheoTenDangNhap(tenDangNhap)
  if (!user) throw { status: 404, message: 'Ten dang nhap khong ton tai' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he cap tren.' }
  if (!user.mat_khau_hash) throw { status: 400, message: 'Tai khoan chua dat mat khau' }
  const match = await bcrypt.compare(matKhau, user.mat_khau_hash)
  if (!match) throw { status: 401, message: 'Mat khau khong dung' }
  const tokens = await tokenService.taoCapToken(user, ctx)
  await nguoiDungRepo.capNhat(user.id, { lan_dang_nhap_cuoi: new Date() })
  return { ...tokens, user }
}

export async function dangNhapDanBangMatKhau(cccd: string, matKhau: string, ctx?: Ctx) {
  const user = await nguoiDungRepo.timTheoCccd(cccd)
  if (!user) throw { status: 404, message: 'Khong tim thay tai khoan' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he can bo xa.' }
  if (!user.mat_khau_hash) throw { status: 400, message: 'Tai khoan chua dat mat khau. Vui long dung OTP.' }
  const match = await bcrypt.compare(matKhau, user.mat_khau_hash)
  if (!match) throw { status: 401, message: 'Mat khau khong dung' }
  await kiemTraHoConCuTru(user)
  const tokens = await tokenService.taoCapToken(user, ctx)
  await nguoiDungRepo.capNhat(user.id, { lan_dang_nhap_cuoi: new Date() })
  return { ...tokens, user }
}

// Cap lai access + refresh token moi tu refresh token cu (co xoay vong)
export async function lamMoiToken(refreshToken: string, ctx?: Ctx) {
  const { userId, tokenHash } = await tokenService.xacThucRefreshToken(refreshToken)
  const user = await nguoiDungRepo.timTheoId(userId)
  if (!user) throw { status: 404, message: 'Khong tim thay nguoi dung' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong.' }
  await kiemTraHoConCuTru(user)
  const tokens = await tokenService.xoayRefreshToken(tokenHash, user, ctx)
  return { ...tokens, user }
}

export async function dangXuat(refreshToken: string) {
  if (refreshToken) {
    await tokenService.thuHoiRefreshToken(refreshToken)
  }
  return { message: 'Da dang xuat' }
}

export async function datMatKhauDan(userId: number, matKhauMoi: string) {
  const user = await nguoiDungRepo.timTheoId(userId)
  if (!user) throw { status: 404, message: 'Khong tim thay nguoi dung' }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Chi nguoi dan moi co the dat mat khau' }
  const hash = await bcrypt.hash(matKhauMoi, 10)
  await nguoiDungRepo.capNhat(userId, { mat_khau_hash: hash, doi_mat_khau_luc: new Date() })
  return { message: 'Dat mat khau thanh cong' }
}

export async function quenMatKhauDan(cccd: string, hoTen: string, soDienThoai: string, matKhauMoi: string) {
  const user = await nguoiDungRepo.timTheoCccd(cccd)
  if (!user) throw { status: 404, message: 'Khong tim thay tai khoan' }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Chi nguoi dan moi co the dung chuc nang nay' }
  if (user.ho_ten.toLowerCase().trim() !== hoTen.toLowerCase().trim()) {
    throw { status: 400, message: 'Ho ten khong khop voi so CCCD' }
  }
  if (user.so_dien_thoai !== soDienThoai) {
    throw { status: 400, message: 'So dien thoai khong khop voi tai khoan' }
  }
  const hash = await bcrypt.hash(matKhauMoi, 10)
  await nguoiDungRepo.capNhat(user.id, { mat_khau_hash: hash, doi_mat_khau_luc: new Date() })
  // Thu hoi toan bo phien cu sau khi doi mat khau
  await refreshTokenRepo.thuHoiTatCaCuaNguoiDung(user.id)
  return { message: 'Doi mat khau thanh cong' }
}

export async function datLaiMatKhauDan(userId: number, matKhauMoi: string) {
  const user = await nguoiDungRepo.timTheoId(userId)
  if (!user) throw { status: 404, message: 'Khong tim thay nguoi dung' }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Chi nguoi dan moi co the dung chuc nang nay' }
  const hash = await bcrypt.hash(matKhauMoi, 10)
  await nguoiDungRepo.capNhat(user.id, { mat_khau_hash: hash, doi_mat_khau_luc: new Date() })
  await refreshTokenRepo.thuHoiTatCaCuaNguoiDung(user.id)
  return { message: 'Doi mat khau thanh cong' }
}
