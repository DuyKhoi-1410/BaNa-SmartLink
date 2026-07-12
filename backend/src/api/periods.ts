import { Router } from 'express'
import * as dotKeKhaiRepo from '../repositories/dotKeKhaiRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { validateDotKeKhai, toPeriodResponse } from '../schema/dto.js'
import { thongBaoTaoDot } from '../services/thongBaoService.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const router = Router()

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { trang_thai } = req.query
  if (trang_thai === 'dang_mo') {
    const rows = await dotKeKhaiRepo.layDangMo()
    return ok(res, rows.map(toPeriodResponse))
  }
  const rows = await dotKeKhaiRepo.layTatCa()
  ok(res, rows.map(toPeriodResponse))
}))

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const dot = await dotKeKhaiRepo.timTheoId(parseInt(req.params.id))
  if (!dot) throw loi.khongThay('Khong tim thay dot ke khai')
  ok(res, toPeriodResponse(dot))
}))

router.post('/', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const errors = validateDotKeKhai(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)
  const dot = await dotKeKhaiRepo.taoMoi({ ...req.body, nguoi_tao_id: req.user.id })
  thongBaoTaoDot(dot, req.user.id).catch(err => console.error('Loi gui thong bao tao dot:', err.message))
  ok(res, toPeriodResponse(dot), 201)
}))

router.patch('/:id/trang-thai', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const { trang_thai } = req.body
  if (!['dang_mo', 'da_dong', 'huy'].includes(trang_thai)) throw loi.xau('Trang thai khong hop le')
  const dot = await dotKeKhaiRepo.capNhatTrangThai(parseInt(req.params.id), trang_thai)
  if (!dot) throw loi.khongThay('Khong tim thay dot ke khai')
  ok(res, toPeriodResponse(dot))
}))

export default router
