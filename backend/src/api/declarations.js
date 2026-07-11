import { Router } from 'express'
import * as keKhaiService from '../services/keKhaiService.js'
import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { validateKeKhaiHo, toDeclarationResponse } from '../schema/dto.js'
import { thongBaoDanNopKeKhai, thongBaoDuyetKeKhai, thongBaoTraLaiKeKhai } from '../services/thongBaoService.js'

const router = Router()

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const rows = await keKhaiHoRepo.layTheoChuHo(req.user.id)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { dot_id, thon_id } = req.query
    if (!dot_id) return res.status(400).json({ error: 'Thieu dot_id' })
    const rows = await keKhaiService.layKeKhaiTheoDot(parseInt(dot_id), thon_id ? parseInt(thon_id) : null)
    res.json(rows.map(toDeclarationResponse))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const kk = await keKhaiHoRepo.timTheoId(parseInt(req.params.id))
    if (!kk) return res.status(404).json({ error: 'Khong tim thay ke khai' })
    res.json(toDeclarationResponse(kk))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, requireRole('dan'), async (req, res) => {
  try {
    const errors = validateKeKhaiHo(req.body)
    if (errors.length) return res.status(400).json({ errors })
    const kk = await keKhaiService.keKhaiHo({ ...req.body, nguoi_ke_khai_id: req.user.id })
    thongBaoDanNopKeKhai(kk, req.user.id).catch(err => console.error('Loi gui thong bao dan nop:', err.message))
    res.status(201).json(toDeclarationResponse(kk))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/duyet', authMiddleware, requireRole('thon'), async (req, res) => {
  try {
    const kk = await keKhaiService.duyetKeKhai(parseInt(req.params.id), req.user.id)
    if (!kk) return res.status(404).json({ error: 'Khong tim thay' })
    thongBaoDuyetKeKhai(kk).catch(err => console.error('Loi gui thong bao duyet:', err.message))
    res.json(toDeclarationResponse(kk))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/tra-lai', authMiddleware, requireRole('thon'), async (req, res) => {
  try {
    const { ly_do } = req.body
    if (!ly_do) return res.status(400).json({ error: 'Thieu ly do tra lai' })
    const kk = await keKhaiService.traLaiKeKhai(parseInt(req.params.id), req.user.id, ly_do)
    if (!kk) return res.status(404).json({ error: 'Khong tim thay' })
    thongBaoTraLaiKeKhai(kk, ly_do).catch(err => console.error('Loi gui thong bao tra lai:', err.message))
    res.json(toDeclarationResponse(kk))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
