import { Router } from 'express'
import bcrypt from 'bcrypt'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import * as thonRepo from '../repositories/thonRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { toUserResponse, toUserDetailResponse, validateTaoHoDan } from '../schema/dto.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { vai_tro, thon_id, trang_thai } = req.query
    const users = await nguoiDungRepo.layDanhSach(vai_tro, thon_id ? parseInt(thon_id) : null, trang_thai)
    res.json(users.map(toUserDetailResponse))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/thon', authMiddleware, async (req, res) => {
  try {
    const danhSach = await thonRepo.layTatCa()
    res.json(danhSach)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await nguoiDungRepo.timTheoId(parseInt(req.params.id))
    if (!user) return res.status(404).json({ error: 'Khong tim thay nguoi dung' })
    res.json(toUserDetailResponse(user))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const errors = validateTaoHoDan(req.body)
    if (errors.length) return res.status(400).json({ errors })

    const existing = await nguoiDungRepo.timTheoCccd(req.body.cccd)
    if (existing) return res.status(409).json({ error: 'CCCD da ton tai trong he thong' })

    const matKhauHash = await bcrypt.hash('123456', 10)

    const newUser = await nguoiDungRepo.taoMoi({
      ho_ten: req.body.ho_ten.trim(),
      cccd: req.body.cccd,
      so_dien_thoai: req.body.so_dien_thoai,
      vai_tro: 'dan',
      thon_id: parseInt(req.body.thon_id),
      ten_dang_nhap: null,
      mat_khau_hash: matKhauHash,
    })

    const user = await nguoiDungRepo.timTheoId(newUser.id)
    res.status(201).json(toUserDetailResponse(user))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/trang-thai', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const { trang_thai } = req.body
    if (!['hoat_dong', 'ngung_hoat_dong'].includes(trang_thai)) {
      return res.status(400).json({ error: 'Trang thai khong hop le' })
    }
    const updated = await nguoiDungRepo.capNhat(parseInt(req.params.id), { trang_thai })
    if (!updated) return res.status(404).json({ error: 'Khong tim thay nguoi dung' })
    const user = await nguoiDungRepo.timTheoId(updated.id)
    res.json(toUserDetailResponse(user))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const { ho_ten, so_dien_thoai, thon_id } = req.body
    const data = {}
    if (ho_ten) data.ho_ten = ho_ten.trim()
    if (so_dien_thoai) data.so_dien_thoai = so_dien_thoai
    if (thon_id) data.thon_id = parseInt(thon_id)
    const updated = await nguoiDungRepo.capNhat(parseInt(req.params.id), data)
    if (!updated) return res.status(404).json({ error: 'Khong tim thay' })
    const user = await nguoiDungRepo.timTheoId(updated.id)
    res.json(toUserDetailResponse(user))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
