import { Router } from 'express'
import bcrypt from 'bcrypt'
import type { Request } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import * as hoDanRepo from '../repositories/hoDanRepo.js'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import * as nhatKyRepo from '../repositories/nhatKyRepo.js'
import { asyncHandler, ok, loi } from '../utils/response.js'
import {
  toHoDanListResponse,
  toHoDanDetailResponse,
  validateTaoHoChuyenDen,
} from '../schema/dto.js'

const router = Router()

function layCtx(req: Request) {
  return {
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
  }
}

// Tat ca route quan ly nhan khau chi danh cho can bo xa
router.use(authMiddleware, requireRole('xa'))

// LIST VIEW: chi thong tin nhan dien co ban, CCCD/SDT bi che 1 phan
router.get('/', asyncHandler(async (req, res) => {
  const { thon_id, trang_thai, tim_kiem } = req.query
  const rows = await hoDanRepo.layDanhSachQuanLy({
    thon_id: thon_id ? parseInt(thon_id as string) : undefined,
    trang_thai: (trang_thai as string) || undefined,
    tim_kiem: (tim_kiem as string) || undefined,
  })
  ok(res, rows.map(toHoDanListResponse))
}))

// DETAIL VIEW: lo day du CCCD/SDT/dia chi -> BAT BUOC ghi log truy cap ho so nhay cam
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const ho = await hoDanRepo.timChiTiet(id)
  if (!ho) throw loi.khongThay('Khong tim thay ho dan')

  const ctx = layCtx(req)
  await nhatKyRepo.ghiTruyCap({
    nguoi_dung_id: req.user.id,
    bang_lien_quan: 'ho_dan',
    ban_ghi_id: id,
    loai_truy_cap: 'xem',
    truong_nhay_cam: 'cccd,so_dien_thoai,dia_chi',
    ip_address: ctx.ip,
    user_agent: ctx.userAgent,
  })

  ok(res, toHoDanDetailResponse(ho))
}))

// Lich su ai da xem ho so nay (phuc vu kiem tra/luu vet)
router.get('/:id/lich-su-truy-cap', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const rows = await nhatKyRepo.layTruyCapTheoBanGhi('ho_dan', id)
  ok(res, rows)
}))

// THEM HO CHUYEN DEN: tao chu ho (nguoi_dung vai_tro dan) + ho_dan
router.post('/', asyncHandler(async (req, res) => {
  const errors = validateTaoHoChuyenDen(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)

  const existing = await nguoiDungRepo.timTheoCccd(req.body.cccd)
  if (existing) throw loi.trung('CCCD da ton tai trong he thong')

  // Mat khau mac dinh cho ho moi (dan dang nhap chinh bang CCCD + ho ten + OTP,
  // mat khau chi la phuong an phu). Lay tu env, hash bcrypt.
  const matKhauMacDinh = process.env.SEED_MAT_KHAU_DAN || 'danmat1'
  const matKhauHash = await bcrypt.hash(matKhauMacDinh, 10)

  const result = await hoDanRepo.taoHoChuyenDen({
    ho_ten: req.body.ho_ten.trim(),
    cccd: req.body.cccd,
    so_dien_thoai: req.body.so_dien_thoai,
    thon_id: parseInt(req.body.thon_id),
    dia_chi: req.body.dia_chi,
    ghi_chu: req.body.ghi_chu,
    mat_khau_hash: matKhauHash,
  })

  const ctx = layCtx(req)
  await nhatKyRepo.ghiNhatKy({
    nguoi_dung_id: req.user.id,
    hanh_dong: 'them_ho_chuyen_den',
    bang_lien_quan: 'ho_dan',
    ban_ghi_id: result.ho_dan.id,
    du_lieu_moi: { ho_ten: req.body.ho_ten, thon_id: req.body.thon_id },
    ip_address: ctx.ip,
    user_agent: ctx.userAgent,
  })

  const chiTiet = await hoDanRepo.timChiTiet(result.ho_dan.id)
  ok(res, toHoDanDetailResponse(chiTiet), 201)
}))

// DANH DAU ROI DI (khong xoa du lieu, chi doi trang thai -> ho khong dang nhap duoc nua)
router.patch('/:id/roi-di', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const truoc = await hoDanRepo.timTheoId(id)
  if (!truoc) throw loi.khongThay('Khong tim thay ho dan')
  if (truoc.trang_thai === 'da_roi') throw loi.xau('Ho nay da o trang thai da roi')

  const ho = await hoDanRepo.danhDauRoiDi(id, req.body.ly_do || '', req.user.id)

  const ctx = layCtx(req)
  await nhatKyRepo.ghiNhatKy({
    nguoi_dung_id: req.user.id,
    hanh_dong: 'danh_dau_ho_roi_di',
    bang_lien_quan: 'ho_dan',
    ban_ghi_id: id,
    du_lieu_cu: { trang_thai: 'dang_cu_tru' },
    du_lieu_moi: { trang_thai: 'da_roi', ly_do: req.body.ly_do },
    ip_address: ctx.ip,
    user_agent: ctx.userAgent,
  })

  ok(res, { message: 'Da danh dau ho roi khoi dia phuong', ho })
}))

// CHO QUAY LAI cu tru
router.patch('/:id/quay-lai', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const truoc = await hoDanRepo.timTheoId(id)
  if (!truoc) throw loi.khongThay('Khong tim thay ho dan')
  if (truoc.trang_thai === 'dang_cu_tru') throw loi.xau('Ho nay dang cu tru')

  const ho = await hoDanRepo.choQuayLai(id, req.user.id)

  const ctx = layCtx(req)
  await nhatKyRepo.ghiNhatKy({
    nguoi_dung_id: req.user.id,
    hanh_dong: 'cho_ho_quay_lai',
    bang_lien_quan: 'ho_dan',
    ban_ghi_id: id,
    ip_address: ctx.ip,
    user_agent: ctx.userAgent,
  })

  ok(res, { message: 'Da cho ho quay lai cu tru', ho })
}))

// CAP NHAT thong tin lien lac (SDT/dia chi/ghi chu)
router.patch('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const truoc = await hoDanRepo.timTheoId(id)
  if (!truoc) throw loi.khongThay('Khong tim thay ho dan')

  const ho = await hoDanRepo.capNhatThongTin(
    id,
    { so_dien_thoai: req.body.so_dien_thoai, dia_chi: req.body.dia_chi, ghi_chu: req.body.ghi_chu },
    truoc.chu_ho_id,
    req.user.id
  )

  const ctx = layCtx(req)
  await nhatKyRepo.ghiNhatKy({
    nguoi_dung_id: req.user.id,
    hanh_dong: 'cap_nhat_thong_tin_ho',
    bang_lien_quan: 'ho_dan',
    ban_ghi_id: id,
    du_lieu_moi: req.body,
    ip_address: ctx.ip,
    user_agent: ctx.userAgent,
  })

  const chiTiet = await hoDanRepo.timChiTiet(id)
  ok(res, toHoDanDetailResponse(chiTiet))
}))

export default router
