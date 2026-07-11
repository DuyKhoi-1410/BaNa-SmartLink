import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'

export async function dangNhapDan(cccd, hoTen) {
  const user = await nguoiDungRepo.timTheoCccd(cccd)
  if (!user) throw { status: 404, message: 'Khong tim thay thong tin. Vui long kiem tra lai so CCCD.' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he can bo xa.' }
  if (user.ho_ten.toLowerCase().trim() !== hoTen.toLowerCase().trim()) {
    throw { status: 400, message: 'Ho ten khong khop voi so CCCD.' }
  }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Tai khoan nay khong phai nguoi dan.' }
  return user
}

export async function xacThucOtp(userId) {
  const user = await nguoiDungRepo.timTheoId(userId)
  if (!user) throw { status: 404, message: 'Khong tim thay nguoi dung' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he can bo xa.' }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Tai khoan nay khong phai nguoi dan.' }
  const token = taoToken(user)
  return { token, user }
}

export async function dangNhapCanBo(tenDangNhap, matKhau) {
  const user = await nguoiDungRepo.timTheoTenDangNhap(tenDangNhap)
  if (!user) throw { status: 404, message: 'Ten dang nhap khong ton tai' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he cap tren.' }
  if (!user.mat_khau_hash) throw { status: 400, message: 'Tai khoan chua dat mat khau' }
  const match = await bcrypt.compare(matKhau, user.mat_khau_hash)
  if (!match) throw { status: 401, message: 'Mat khau khong dung' }
  const token = taoToken(user)
  return { token, user }
}

export async function dangNhapDanBangMatKhau(cccd, matKhau) {
  const user = await nguoiDungRepo.timTheoCccd(cccd)
  if (!user) throw { status: 404, message: 'Khong tim thay tai khoan' }
  if (user.trang_thai === 'ngung_hoat_dong') throw { status: 403, message: 'Tai khoan da ngung hoat dong. Vui long lien he can bo xa.' }
  if (!user.mat_khau_hash) throw { status: 400, message: 'Tai khoan chua dat mat khau. Vui long dung OTP.' }
  const match = await bcrypt.compare(matKhau, user.mat_khau_hash)
  if (!match) throw { status: 401, message: 'Mat khau khong dung' }
  const token = taoToken(user)
  return { token, user }
}

export async function datMatKhauDan(userId, matKhauMoi) {
  const user = await nguoiDungRepo.timTheoId(userId)
  if (!user) throw { status: 404, message: 'Khong tim thay nguoi dung' }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Chi nguoi dan moi co the dat mat khau' }
  const hash = await bcrypt.hash(matKhauMoi, 10)
  await nguoiDungRepo.capNhat(userId, { mat_khau_hash: hash })
  return { message: 'Dat mat khau thanh cong' }
}

export async function quenMatKhauDan(cccd, hoTen, soDienThoai, matKhauMoi) {
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
  await nguoiDungRepo.capNhat(user.id, { mat_khau_hash: hash })
  return { message: 'Doi mat khau thanh cong' }
}

export async function datLaiMatKhauDan(userId, matKhauMoi) {
  const user = await nguoiDungRepo.timTheoId(userId)
  if (!user) throw { status: 404, message: 'Khong tim thay nguoi dung' }
  if (user.vai_tro !== 'dan') throw { status: 403, message: 'Chi nguoi dan moi co the dung chuc nang nay' }
  const hash = await bcrypt.hash(matKhauMoi, 10)
  await nguoiDungRepo.capNhat(user.id, { mat_khau_hash: hash })
  return { message: 'Doi mat khau thanh cong' }
}

function taoToken(user) {
  return jwt.sign(
    { id: user.id, ho_ten: user.ho_ten, vai_tro: user.vai_tro, thon_id: user.thon_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}
