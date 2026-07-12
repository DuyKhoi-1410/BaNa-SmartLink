import { Router } from 'express'
import * as thongBaoRepo from '../repositories/thongBaoRepo.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const router = Router()

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { thon_id } = req.query
  if (thon_id) {
    const rows = await thongBaoRepo.layTheoThon(parseInt(thon_id as string))
    return ok(res, rows)
  }
  const rows = await thongBaoRepo.layTheoNguoiNhan(req.user.id)
  ok(res, rows)
}))

router.get('/chua-doc', authMiddleware, asyncHandler(async (req, res) => {
  const { thon_id } = req.query
  let count
  if (thon_id) {
    count = await thongBaoRepo.demChuaDocTheoThon(parseInt(thon_id as string))
  } else {
    count = await thongBaoRepo.demChuaDoc(req.user.id)
  }
  ok(res, { so_chua_doc: count })
}))

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { tieu_de, noi_dung, nguoi_nhan_id, thon_id, dot_id, loai } = req.body
  if (!tieu_de || !noi_dung) throw loi.xau('Thieu tieu de hoac noi dung')
  const tb = await thongBaoRepo.taoMoi({
    tieu_de, noi_dung, loai, nguoi_gui_id: req.user.id, nguoi_nhan_id, thon_id, dot_id,
  })
  ok(res, tb, 201)
}))

router.patch('/:id/doc', authMiddleware, asyncHandler(async (req, res) => {
  const tb = await thongBaoRepo.danhDauDaDoc(parseInt(req.params.id))
  if (!tb) throw loi.khongThay('Khong tim thay thong bao')
  ok(res, tb)
}))

export default router
