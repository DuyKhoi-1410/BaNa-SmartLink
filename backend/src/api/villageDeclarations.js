import { Router } from 'express'
import * as keKhaiService from '../services/keKhaiService.js'
import * as keKhaiThonRepo from '../repositories/keKhaiThonRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { validateKeKhaiThon } from '../schema/dto.js'
import { thongBaoThonNopXa } from '../services/thongBaoService.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { dot_id } = req.query
    if (!dot_id) return res.status(400).json({ error: 'Thieu dot_id' })
    const rows = await keKhaiThonRepo.layTheoDot(parseInt(dot_id))
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:dotId/:thonId', authMiddleware, async (req, res) => {
  try {
    const data = await keKhaiThonRepo.timTheoDotVaThon(parseInt(req.params.dotId), parseInt(req.params.thonId))
    if (!data) return res.json(null)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, requireRole('thon'), async (req, res) => {
  try {
    const errors = validateKeKhaiThon(req.body)
    if (errors.length) return res.status(400).json({ errors })
    const data = await keKhaiService.keKhaiThon({ ...req.body, nguoi_nhap_id: req.user.id })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:dotId/:thonId/nop-xa', authMiddleware, requireRole('thon'), async (req, res) => {
  try {
    const dotId = parseInt(req.params.dotId)
    const thonId = parseInt(req.params.thonId)
    const data = await keKhaiService.nopThonLenXa(dotId, thonId)
    if (!data) return res.status(404).json({ error: 'Khong tim thay' })
    thongBaoThonNopXa(dotId, thonId).catch(err => console.error('Loi gui thong bao nop xa:', err.message))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
