import { Router } from 'express'
import * as hoDanRepo from '../repositories/hoDanRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { toHouseholdResponse } from '../schema/dto.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const router = Router()

router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const ho = await hoDanRepo.timTheoChuHo(req.user.id)
  if (!ho) throw loi.khongThay('Khong tim thay ho dan')
  ok(res, toHouseholdResponse(ho))
}))

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { thon_id, trang_thai } = req.query
  // Can bo thon chi thay ho trong thon minh
  const thonId = req.user.vai_tro === 'thon' ? req.user.thon_id : (thon_id ? parseInt(thon_id as string) : null)
  if (thonId) {
    const rows = await hoDanRepo.layTheoThon(thonId, trang_thai as string)
    return ok(res, rows.map(toHouseholdResponse))
  }
  const rows = await hoDanRepo.layTatCa()
  ok(res, rows.map(toHouseholdResponse))
}))

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const ho = await hoDanRepo.timTheoId(parseInt(req.params.id))
  if (!ho) throw loi.khongThay('Khong tim thay ho dan')
  ok(res, toHouseholdResponse(ho))
}))

router.post('/', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const ho = await hoDanRepo.taoMoi(req.body)
  ok(res, toHouseholdResponse(ho), 201)
}))

router.patch('/:id/trang-thai', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const { trang_thai } = req.body
  if (!['dang_cu_tru', 'da_roi'].includes(trang_thai)) throw loi.xau('Trang thai khong hop le')
  const ho = await hoDanRepo.capNhatTrangThai(parseInt(req.params.id), trang_thai)
  if (!ho) throw loi.khongThay('Khong tim thay ho dan')
  ok(res, toHouseholdResponse(ho))
}))

export default router
