import { Router } from 'express'
import * as authService from '../services/authService.js'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import { validateLoginDan, validateLoginCanBo, toUserResponse } from '../schema/dto.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/dan/xac-minh', async (req, res) => {
  try {
    const errors = validateLoginDan(req.body)
    if (errors.length) return res.status(400).json({ errors })
    const user = await authService.dangNhapDan(req.body.cccd, req.body.ho_ten)
    const sdtMasked = user.so_dien_thoai ? '*'.repeat(7) + user.so_dien_thoai.slice(-3) : null
    res.json({ user_id: user.id, ho_ten: user.ho_ten, sdt_masked: sdtMasked })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.post('/dan/otp', async (req, res) => {
  try {
    const { user_id } = req.body
    if (!user_id) return res.status(400).json({ error: 'Thieu thong tin' })
    const result = await authService.xacThucOtp(user_id)
    res.json({ token: result.token, user: toUserResponse(result.user) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.post('/dan/mat-khau', async (req, res) => {
  try {
    const { cccd, mat_khau } = req.body
    if (!cccd || !mat_khau) return res.status(400).json({ error: 'Thieu thong tin' })
    const result = await authService.dangNhapDanBangMatKhau(cccd, mat_khau)
    res.json({ token: result.token, user: toUserResponse(result.user) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.post('/can-bo', async (req, res) => {
  try {
    const errors = validateLoginCanBo(req.body)
    if (errors.length) return res.status(400).json({ errors })
    const result = await authService.dangNhapCanBo(req.body.ten_dang_nhap, req.body.mat_khau)
    res.json({ token: result.token, user: toUserResponse(result.user) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.patch('/dan/dat-mat-khau', authMiddleware, async (req, res) => {
  try {
    const { mat_khau_moi } = req.body
    if (!mat_khau_moi || mat_khau_moi.length < 6) {
      return res.status(400).json({ error: 'Mat khau phai co it nhat 6 ky tu' })
    }
    const result = await authService.datMatKhauDan(req.user.id, mat_khau_moi)
    res.json(result)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.post('/dan/quen-mat-khau', async (req, res) => {
  try {
    const { cccd, ho_ten, so_dien_thoai, mat_khau_moi } = req.body
    if (!cccd || !ho_ten || !so_dien_thoai || !mat_khau_moi) {
      return res.status(400).json({ error: 'Thieu thong tin' })
    }
    if (mat_khau_moi.length < 6) {
      return res.status(400).json({ error: 'Mat khau phai co it nhat 6 ky tu' })
    }
    const result = await authService.quenMatKhauDan(cccd, ho_ten, so_dien_thoai, mat_khau_moi)
    res.json(result)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.post('/dan/dat-lai-mat-khau', authMiddleware, async (req, res) => {
  try {
    const { mat_khau_moi } = req.body
    if (!mat_khau_moi) {
      return res.status(400).json({ error: 'Thieu thong tin' })
    }
    if (mat_khau_moi.length < 6) {
      return res.status(400).json({ error: 'Mat khau phai co it nhat 6 ky tu' })
    }
    const result = await authService.datLaiMatKhauDan(req.user.id, mat_khau_moi)
    res.json(result)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ error: 'Chua dang nhap' })
    const jwt = await import('jsonwebtoken')
    const token = header.split(' ')[1]
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET)
    const user = await nguoiDungRepo.timTheoId(decoded.id)
    if (!user) return res.status(401).json({ error: 'Tai khoan khong ton tai' })
    res.json({ user: toUserResponse(user) })
  } catch (err) {
    res.status(401).json({ error: 'Token het han' })
  }
})

export default router
