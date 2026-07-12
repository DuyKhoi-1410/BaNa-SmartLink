import { Router } from 'express'
import * as keKhaiService from '../services/keKhaiService.js'
import * as keKhaiThonRepo from '../repositories/keKhaiThonRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { validateKeKhaiThon } from '../schema/dto.js'
import { thongBaoThonNopXa } from '../services/thongBaoService.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const router = Router()

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { dot_id } = req.query
  if (!dot_id) throw loi.xau('Thieu dot_id')
  const rows = await keKhaiThonRepo.layTheoDot(parseInt(dot_id as string))
  ok(res, rows)
}))

router.get('/:dotId/:thonId', authMiddleware, asyncHandler(async (req, res) => {
  const data = await keKhaiThonRepo.timTheoDotVaThon(parseInt(req.params.dotId), parseInt(req.params.thonId))
  ok(res, data || null)
}))

router.post('/', authMiddleware, requireRole('thon'), asyncHandler(async (req, res) => {
  const errors = validateKeKhaiThon(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)
  // Can bo thon chi duoc nhap cho thon cua minh
  const data = await keKhaiService.keKhaiThon({ ...req.body, thon_id: req.user.thon_id, nguoi_nhap_id: req.user.id })
  ok(res, data, 201)
}))

router.patch('/:dotId/:thonId/nop-xa', authMiddleware, requireRole('thon'), asyncHandler(async (req, res) => {
  const dotId = parseInt(req.params.dotId)
  const thonId = parseInt(req.params.thonId)
  if (thonId !== req.user.thon_id) throw loi.camTruyCap('Chi duoc nop bao cao cua thon minh')
  const data = await keKhaiService.nopThonLenXa(dotId, thonId)
  if (!data) throw loi.khongThay('Khong tim thay ke khai thon')
  thongBaoThonNopXa(dotId, thonId).catch(err => console.error('Loi gui thong bao nop xa:', err.message))
  ok(res, data)
}))

export default router
