import { Router } from 'express'
import * as keKhaiService from '../services/keKhaiService.js'
import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import * as thonRepo from '../repositories/thonRepo.js'
import * as dotKeKhaiRepo from '../repositories/dotKeKhaiRepo.js'
import { dotCoCTDan } from '../repositories/dotKeKhaiRepo.js'
import { authMiddleware } from '../middleware/auth.js'
import { xuatExcelTongHop } from '../services/xuatFileService.js'
import { asyncHandler, ok } from '../utils/response.js'

const router = Router()

router.get('/tien-do/:dotId', authMiddleware, asyncHandler(async (req, res) => {
  const dotId = parseInt(req.params.dotId)
  const dot = await dotKeKhaiRepo.timTheoId(dotId)
  const danCanKe = dot ? dotCoCTDan(dot.chi_tieu) : true
  const { thon_id } = req.query
  if (thon_id) {
    const tienDo = await keKhaiService.tienDoThon(dotId, parseInt(thon_id as string))
    return ok(res, { ...tienDo, dan_khong_can_ke: !danCanKe })
  }
  const results = await keKhaiHoRepo.tienDoTatCaThon(dotId)
  ok(res, results.map(r => ({ ...r, dan_khong_can_ke: !danCanKe })))
}))

router.get('/tong-hop/:dotId', authMiddleware, asyncHandler(async (req, res) => {
  const dotId = parseInt(req.params.dotId)
  const { thon_id } = req.query
  if (thon_id) {
    const data = await keKhaiService.tongHopThon(dotId, parseInt(thon_id as string))
    return ok(res, data)
  }
  const data = await keKhaiService.tongHopXa(dotId)
  ok(res, data)
}))

router.get('/tong-hop-moi-nhat', authMiddleware, asyncHandler(async (req, res) => {
  const data = await keKhaiService.tongHopMoiNhat()
  ok(res, data)
}))

router.get('/ke-khai-ho/:dotId', authMiddleware, asyncHandler(async (req, res) => {
  const dotId = parseInt(req.params.dotId)
  const { thon_id } = req.query
  const rows = await keKhaiHoRepo.layTheoDot(dotId, thon_id ? parseInt(thon_id as string) : undefined)
  ok(res, rows)
}))

router.get('/thon', authMiddleware, asyncHandler(async (req, res) => {
  const thons = await thonRepo.layTatCa()
  ok(res, thons)
}))

// Xuat Excel: tra ve file binary, KHONG boc envelope
router.get('/xuat-excel/:dotId', authMiddleware, asyncHandler(async (req, res) => {
  const dotId = parseInt(req.params.dotId)
  const { workbook, tenFile } = await xuatExcelTongHop(dotId)
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(tenFile)}"; filename*=UTF-8''${encodeURIComponent(tenFile)}`)
  await workbook.xlsx.write(res)
  res.end()
}))

export default router
