import { Router } from 'express'
import * as authService from '../services/authService.js'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import { validateLoginDan, validateLoginCanBo, toUserResponse } from '../schema/dto.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler, ok, loi } from '../utils/response.js'
import type { Request } from 'express'

const router = Router()

function layCtx(req: Request) {
  return {
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
  }
}

// Buoc 1 dan: xac minh CCCD + ho ten -> tra SDT da che
router.post('/dan/xac-minh', asyncHandler(async (req, res) => {
  const errors = validateLoginDan(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)
  const user = await authService.dangNhapDan(req.body.cccd, req.body.ho_ten)
  const sdtMasked = user.so_dien_thoai ? '*'.repeat(7) + user.so_dien_thoai.slice(-3) : null
  ok(res, { user_id: user.id, ho_ten: user.ho_ten, sdt_masked: sdtMasked })
}))

// Buoc 2 dan (OTP): xac thuc OTP -> tra cap token
router.post('/dan/otp', asyncHandler(async (req, res) => {
  const { user_id } = req.body
  if (!user_id) throw loi.xau('Thieu thong tin')
  const result = await authService.xacThucOtp(user_id, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Dan dang nhap bang mat khau
router.post('/dan/mat-khau', asyncHandler(async (req, res) => {
  const { cccd, mat_khau } = req.body
  if (!cccd || !mat_khau) throw loi.xau('Thieu thong tin')
  const result = await authService.dangNhapDanBangMatKhau(cccd, mat_khau, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Can bo (thon/xa) dang nhap
router.post('/can-bo', asyncHandler(async (req, res) => {
  const errors = validateLoginCanBo(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)
  const result = await authService.dangNhapCanBo(req.body.ten_dang_nhap, req.body.mat_khau, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Lam moi token (access 30p het han -> dung refresh 7d)
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw loi.xau('Thieu refresh token')
  const result = await authService.lamMoiToken(refreshToken, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Dang xuat: thu hoi refresh token
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await authService.dangXuat(refreshToken)
  ok(res, result)
}))

router.patch('/dan/dat-mat-khau', authMiddleware, asyncHandler(async (req, res) => {
  const { mat_khau_moi } = req.body
  if (!mat_khau_moi || mat_khau_moi.length < 6) throw loi.xau('Mat khau phai co it nhat 6 ky tu')
  const result = await authService.datMatKhauDan(req.user.id, mat_khau_moi)
  ok(res, result)
}))

router.post('/dan/quen-mat-khau', asyncHandler(async (req, res) => {
  const { cccd, ho_ten, so_dien_thoai, mat_khau_moi } = req.body
  if (!cccd || !ho_ten || !so_dien_thoai || !mat_khau_moi) throw loi.xau('Thieu thong tin')
  if (mat_khau_moi.length < 6) throw loi.xau('Mat khau phai co it nhat 6 ky tu')
  const result = await authService.quenMatKhauDan(cccd, ho_ten, so_dien_thoai, mat_khau_moi)
  ok(res, result)
}))

router.post('/dan/dat-lai-mat-khau', authMiddleware, asyncHandler(async (req, res) => {
  const { mat_khau_moi } = req.body
  if (!mat_khau_moi) throw loi.xau('Thieu thong tin')
  if (mat_khau_moi.length < 6) throw loi.xau('Mat khau phai co it nhat 6 ky tu')
  const result = await authService.datLaiMatKhauDan(req.user.id, mat_khau_moi)
  ok(res, result)
}))

// Thong tin nguoi dung hien tai
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await nguoiDungRepo.timTheoId(req.user.id)
  if (!user) throw loi.chuaDangNhap('Tai khoan khong ton tai')
  ok(res, { user: toUserResponse(user) })
}))

export default router
