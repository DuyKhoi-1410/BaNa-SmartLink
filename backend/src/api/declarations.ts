import { Router } from 'express'
import * as keKhaiService from '../services/keKhaiService.js'
import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { validateKeKhaiHo, toDeclarationResponse, sanitizeKeKhaiFields } from '../schema/dto.js'
import { thongBaoDanNopKeKhai, thongBaoDuyetKeKhai, thongBaoTraLaiKeKhai } from '../services/thongBaoService.js'
import { kiemTraBatThuong } from '../services/anomalyService.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const router = Router()

router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const rows = await keKhaiHoRepo.layTheoChuHo(req.user.id)
  ok(res, rows)
}))

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { dot_id, thon_id } = req.query
  if (!dot_id) throw loi.xau('Thieu dot_id')
  // Can bo thon chi duoc xem ke khai thon minh
  const thonId = req.user.vai_tro === 'thon' ? req.user.thon_id : (thon_id ? parseInt(thon_id as string) : null)
  const rows = await keKhaiService.layKeKhaiTheoDot(parseInt(dot_id as string), thonId)
  ok(res, rows.map(toDeclarationResponse))
}))

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const kk = await keKhaiHoRepo.timTheoId(parseInt(req.params.id))
  if (!kk) throw loi.khongThay('Khong tim thay ke khai')
  ok(res, toDeclarationResponse(kk))
}))

router.post('/', authMiddleware, requireRole('dan'), asyncHandler(async (req, res) => {
  sanitizeKeKhaiFields(req.body)
  const errors = validateKeKhaiHo(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)
  const kk = await keKhaiService.keKhaiHo({ ...req.body, nguoi_ke_khai_id: req.user.id })
  thongBaoDanNopKeKhai(kk, req.user.id).catch(err => console.error('Loi gui thong bao dan nop:', err.message))
  kiemTraBatThuong(kk).catch(err => console.error('Loi kiem tra bat thuong:', err.message))
  ok(res, toDeclarationResponse(kk), 201)
}))

router.patch('/:id/duyet', authMiddleware, requireRole('thon'), asyncHandler(async (req, res) => {
  const kk = await keKhaiService.duyetKeKhai(parseInt(req.params.id), req.user.id)
  if (!kk) throw loi.khongThay('Khong tim thay ke khai')
  thongBaoDuyetKeKhai(kk).catch(err => console.error('Loi gui thong bao duyet:', err.message))
  ok(res, toDeclarationResponse(kk))
}))

router.patch('/:id/tra-lai', authMiddleware, requireRole('thon'), asyncHandler(async (req, res) => {
  const { ly_do, chi_tieu_tra_lai } = req.body
  if (!ly_do) throw loi.xau('Thieu ly do tra lai')
  const kk = await keKhaiService.traLaiKeKhai(parseInt(req.params.id), req.user.id, ly_do, chi_tieu_tra_lai)
  if (!kk) throw loi.khongThay('Khong tim thay ke khai')
  thongBaoTraLaiKeKhai(kk, ly_do).catch(err => console.error('Loi gui thong bao tra lai:', err.message))
  ok(res, toDeclarationResponse(kk))
}))

export default router
