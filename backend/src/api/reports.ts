import { Router } from 'express'
import * as keKhaiService from '../services/keKhaiService.js'
import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import * as thonRepo from '../repositories/thonRepo.js'
import { authMiddleware } from '../middleware/auth.js'
import { xuatExcelTongHop } from '../services/xuatFileService.js'
import { asyncHandler, ok } from '../utils/response.js'

const router = Router()

router.get('/tien-do/:dotId', authMiddleware, asyncHandler(async (req, res) => {
  const dotId = parseInt(req.params.dotId)
  const { thon_id } = req.query
  if (thon_id) {
    const tienDo = await keKhaiService.tienDoThon(dotId, parseInt(thon_id as string))
    return ok(res, tienDo)
  }
  const results = await keKhaiHoRepo.tienDoTatCaThon(dotId)
  ok(res, results)
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

router.get('/thon', authMiddleware, asyncHandler(async (req, res) => {
  const thons = await thonRepo.layTatCa()
  ok(res, thons)
}))

// Xuat Excel: tra ve file binary, KHONG boc envelope
router.get('/xuat-excel/:dotId', authMiddleware, asyncHandler(async (req, res) => {
  const dotId = parseInt(req.params.dotId)
  const { workbook, tenFile } = await xuatExcelTongHop(dotId)
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(tenFile)}"`)
  await workbook.xlsx.write(res)
  res.end()
}))

export default router
