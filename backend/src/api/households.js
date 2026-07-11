import { Router } from 'express'
import * as hoDanRepo from '../repositories/hoDanRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { toHouseholdResponse } from '../schema/dto.js'

const router = Router()

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const ho = await hoDanRepo.timTheoChuHo(req.user.id)
    if (!ho) return res.status(404).json({ error: 'Khong tim thay ho dan' })
    res.json(toHouseholdResponse(ho))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { thon_id, trang_thai } = req.query
    if (thon_id) {
      const rows = await hoDanRepo.layTheoThon(parseInt(thon_id), trang_thai)
      return res.json(rows.map(toHouseholdResponse))
    }
    const rows = await hoDanRepo.layTatCa()
    res.json(rows.map(toHouseholdResponse))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ho = await hoDanRepo.timTheoId(parseInt(req.params.id))
    if (!ho) return res.status(404).json({ error: 'Khong tim thay ho dan' })
    res.json(toHouseholdResponse(ho))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const ho = await hoDanRepo.taoMoi(req.body)
    res.status(201).json(ho)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/trang-thai', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const { trang_thai } = req.body
    if (!['dang_cu_tru', 'da_roi'].includes(trang_thai)) {
      return res.status(400).json({ error: 'Trang thai khong hop le' })
    }
    const ho = await hoDanRepo.capNhatTrangThai(parseInt(req.params.id), trang_thai)
    if (!ho) return res.status(404).json({ error: 'Khong tim thay' })
    res.json(ho)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
