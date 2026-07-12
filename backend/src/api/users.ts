import { Router } from 'express'
import bcrypt from 'bcrypt'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import * as thonRepo from '../repositories/thonRepo.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { toUserDetailResponse, validateTaoHoDan } from '../schema/dto.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const router = Router()

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { vai_tro, thon_id, trang_thai } = req.query
  const users = await nguoiDungRepo.layDanhSach(
    vai_tro as string,
    thon_id ? parseInt(thon_id as string) : null,
    trang_thai as string
  )
  ok(res, users.map(toUserDetailResponse))
}))

router.get('/thon', authMiddleware, asyncHandler(async (req, res) => {
  const danhSach = await thonRepo.layTatCa()
  ok(res, danhSach)
}))

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const user = await nguoiDungRepo.timTheoId(parseInt(req.params.id))
  if (!user) throw loi.khongThay('Khong tim thay nguoi dung')
  ok(res, toUserDetailResponse(user))
}))

router.post('/', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const errors = validateTaoHoDan(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)

  const existing = await nguoiDungRepo.timTheoCccd(req.body.cccd)
  if (existing) throw loi.trung('CCCD da ton tai trong he thong')

  // Mat khau mac dinh lay tu env (khong hardcode)
  const matKhauMacDinh = process.env.SEED_MAT_KHAU_DAN || 'danmat1'
  const matKhauHash = await bcrypt.hash(matKhauMacDinh, 10)

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
  ok(res, toUserDetailResponse(user), 201)
}))

router.patch('/:id/trang-thai', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const { trang_thai } = req.body
  if (!['hoat_dong', 'ngung_hoat_dong'].includes(trang_thai)) throw loi.xau('Trang thai khong hop le')
  const updated = await nguoiDungRepo.capNhat(parseInt(req.params.id), { trang_thai })
  if (!updated) throw loi.khongThay('Khong tim thay nguoi dung')
  const user = await nguoiDungRepo.timTheoId(updated.id)
  ok(res, toUserDetailResponse(user))
}))

router.put('/:id', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const { ho_ten, so_dien_thoai, thon_id } = req.body
  const data: any = {}
  if (ho_ten) data.ho_ten = ho_ten.trim()
  if (so_dien_thoai) data.so_dien_thoai = so_dien_thoai
  if (thon_id) data.thon_id = parseInt(thon_id)
  const updated = await nguoiDungRepo.capNhat(parseInt(req.params.id), data)
  if (!updated) throw loi.khongThay('Khong tim thay nguoi dung')
  const user = await nguoiDungRepo.timTheoId(updated.id)
  ok(res, toUserDetailResponse(user))
}))

export default router
