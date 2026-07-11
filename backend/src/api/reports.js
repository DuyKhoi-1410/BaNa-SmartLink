import { Router } from 'express'
import * as keKhaiService from '../services/keKhaiService.js'
import * as thonRepo from '../repositories/thonRepo.js'
import { authMiddleware } from '../middleware/auth.js'
import { xuatExcelTongHop } from '../services/xuatFileService.js'

const router = Router()

router.get('/tien-do/:dotId', authMiddleware, async (req, res) => {
  try {
    const dotId = parseInt(req.params.dotId)
    const { thon_id } = req.query
    if (thon_id) {
      const tienDo = await keKhaiService.tienDoThon(dotId, parseInt(thon_id))
      return res.json(tienDo)
    }
    const thons = await thonRepo.layTatCa()
    const results = []
    for (const thon of thons) {
      const tienDo = await keKhaiService.tienDoThon(dotId, thon.id)
      results.push({ thon_id: thon.id, ten_thon: thon.ten_thon, ...tienDo })
    }
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/tong-hop/:dotId', authMiddleware, async (req, res) => {
  try {
    const dotId = parseInt(req.params.dotId)
    const { thon_id } = req.query
    if (thon_id) {
      const data = await keKhaiService.tongHopThon(dotId, parseInt(thon_id))
      return res.json(data)
    }
    const data = await keKhaiService.tongHopXa(dotId)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/thon', authMiddleware, async (req, res) => {
  try {
    const thons = await thonRepo.layTatCa()
    res.json(thons)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/xuat-excel/:dotId', authMiddleware, async (req, res) => {
  try {
    const dotId = parseInt(req.params.dotId)
    const { workbook, tenFile } = await xuatExcelTongHop(dotId)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(tenFile)}"`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
