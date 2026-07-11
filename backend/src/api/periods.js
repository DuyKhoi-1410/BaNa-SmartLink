import { Router } from 'express'
import * as dotKeKhaiRepo from '../repositories/dotKeKhaiRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { validateDotKeKhai, toPeriodResponse } from '../schema/dto.js'
import { thongBaoTaoDot } from '../services/thongBaoService.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { trang_thai } = req.query
    if (trang_thai === 'dang_mo') {
      const rows = await dotKeKhaiRepo.layDangMo()
      return res.json(rows.map(toPeriodResponse))
    }
    const rows = await dotKeKhaiRepo.layTatCa()
    res.json(rows.map(toPeriodResponse))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const dot = await dotKeKhaiRepo.timTheoId(parseInt(req.params.id))
    if (!dot) return res.status(404).json({ error: 'Khong tim thay dot ke khai' })
    res.json(toPeriodResponse(dot))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const errors = validateDotKeKhai(req.body)
    if (errors.length) return res.status(400).json({ errors })
    const dot = await dotKeKhaiRepo.taoMoi({ ...req.body, nguoi_tao_id: req.user.id })
    thongBaoTaoDot(dot, req.user.id).catch(err => console.error('Loi gui thong bao tao dot:', err.message))
    res.status(201).json(toPeriodResponse(dot))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/trang-thai', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const { trang_thai } = req.body
    if (!['dang_mo', 'da_dong', 'huy'].includes(trang_thai)) {
      return res.status(400).json({ error: 'Trang thai khong hop le' })
    }
    const dot = await dotKeKhaiRepo.capNhatTrangThai(parseInt(req.params.id), trang_thai)
    if (!dot) return res.status(404).json({ error: 'Khong tim thay' })
    res.json(toPeriodResponse(dot))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
