import { Router } from 'express'
import * as thongBaoRepo from '../repositories/thongBaoRepo.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { thon_id } = req.query
    if (thon_id) {
      const rows = await thongBaoRepo.layTheoThon(parseInt(thon_id))
      return res.json(rows)
    }
    const rows = await thongBaoRepo.layTheoNguoiNhan(req.user.id)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/chua-doc', authMiddleware, async (req, res) => {
  try {
    const { thon_id } = req.query
    let count
    if (thon_id) {
      count = await thongBaoRepo.demChuaDocTheoThon(parseInt(thon_id))
    } else {
      count = await thongBaoRepo.demChuaDoc(req.user.id)
    }
    res.json({ so_chua_doc: count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tieu_de, noi_dung, nguoi_nhan_id, thon_id, dot_id, loai } = req.body
    if (!tieu_de || !noi_dung) return res.status(400).json({ error: 'Thieu tieu de hoac noi dung' })
    const tb = await thongBaoRepo.taoMoi({
      tieu_de, noi_dung, loai, nguoi_gui_id: req.user.id, nguoi_nhan_id, thon_id, dot_id,
    })
    res.status(201).json(tb)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/doc', authMiddleware, async (req, res) => {
  try {
    const tb = await thongBaoRepo.danhDauDaDoc(parseInt(req.params.id))
    if (!tb) return res.status(404).json({ error: 'Khong tim thay' })
    res.json(tb)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
