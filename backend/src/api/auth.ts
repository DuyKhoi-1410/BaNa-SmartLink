import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as authService from '../services/authService.js'
import * as nguoiDungRepo from '../repositories/nguoiDungRepo.js'
import * as refreshTokenRepo from '../repositories/refreshTokenRepo.js'
import { hashToken } from '../services/tokenService.js'
import { validateLoginDan, validateLoginCanBo, toUserResponse } from '../schema/dto.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler, ok, loi } from '../utils/response.js'
import type { Request } from 'express'
import { optimizeImage } from '../utils/imageOptimizer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
const AVATAR_BUCKET = 'avatars'

const TEMP_DIR = path.join(__dirname, '..', '..', 'uploads', '_temp')
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true })

const avatarUpload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Chi chap nhan anh JPG, PNG hoac WebP'))
    }
    cb(null, true)
  },
})

async function uploadAvatarToStorage(filePath: string, storagePath: string, mimetype: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': mimetype,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upload avatar that bai: ${err}`)
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${storagePath}`
}

async function deleteAvatarFromStorage(fileUrl: string) {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/`
  if (!fileUrl || !fileUrl.startsWith(prefix)) return
  const storagePath = fileUrl.slice(prefix.length)
  await fetch(`${SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}/${storagePath}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
  })
}

function parseUserAgent(ua: string | null): { ten: string; loai: 'desktop' | 'phone' | 'tablet' } {
  if (!ua) return { ten: 'Thiết bị không xác định', loai: 'desktop' }
  let os = 'Unknown', browser = 'Unknown'
  let loai: 'desktop' | 'phone' | 'tablet' = 'desktop'

  if (/iPad/.test(ua)) { os = 'iPad'; loai = 'tablet' }
  else if (/iPhone/.test(ua)) { os = 'iPhone'; loai = 'phone' }
  else if (/Android.*Mobile/.test(ua)) { os = 'Android'; loai = 'phone' }
  else if (/Android/.test(ua)) { os = 'Android Tablet'; loai = 'tablet' }
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'

  return { ten: `${os} — ${browser}`, loai }
}

const router = Router()

function layCtx(req: Request) {
  return {
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
  }
}

// Buoc 1 dan: xac minh CCCD + ho ten -> tra SDT da che
router.post('/dan/xac-minh', asyncHandler(async (req, res) => {
  const errors = validateLoginDan(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)
  const user = await authService.dangNhapDan(req.body.cccd, req.body.ho_ten)
  const sdtMasked = user.so_dien_thoai ? '*'.repeat(7) + user.so_dien_thoai.slice(-3) : null
  ok(res, { user_id: user.id, ho_ten: user.ho_ten, sdt_masked: sdtMasked, co_mat_khau: !!user.mat_khau_hash })
}))

// Buoc 2 dan (OTP): xac thuc OTP -> tra cap token
router.post('/dan/otp', asyncHandler(async (req, res) => {
  const { user_id } = req.body
  if (!user_id) throw loi.xau('Thieu thong tin')
  const result = await authService.xacThucOtp(user_id, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Dan dang nhap bang mat khau
router.post('/dan/mat-khau', asyncHandler(async (req, res) => {
  const { cccd, mat_khau } = req.body
  if (!cccd || !mat_khau) throw loi.xau('Thieu thong tin')
  const result = await authService.dangNhapDanBangMatKhau(cccd, mat_khau, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Can bo (thon/xa) dang nhap - ho tro ten_dang_nhap / email / so_dien_thoai
router.post('/can-bo', asyncHandler(async (req, res) => {
  const errors = validateLoginCanBo(req.body)
  if (errors.length) throw loi.kiemTra('Du lieu khong hop le', errors)
  const result = await authService.dangNhapCanBo(req.body.tai_khoan, req.body.mat_khau, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Lam moi token (access 30p het han -> dung refresh 7d)
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw loi.xau('Thieu refresh token')
  const result = await authService.lamMoiToken(refreshToken, layCtx(req))
  ok(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toUserResponse(result.user),
  })
}))

// Dang xuat: thu hoi refresh token
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await authService.dangXuat(refreshToken)
  ok(res, result)
}))

router.patch('/dan/dat-mat-khau', authMiddleware, asyncHandler(async (req, res) => {
  const { mat_khau_moi } = req.body
  if (!mat_khau_moi || mat_khau_moi.length < 6) throw loi.xau('Mat khau phai co it nhat 6 ky tu')
  const result = await authService.datMatKhauDan(req.user.id, mat_khau_moi)
  ok(res, result)
}))

router.post('/dan/quen-mat-khau', asyncHandler(async (req, res) => {
  const { cccd, ho_ten, so_dien_thoai, mat_khau_moi } = req.body
  if (!cccd || !ho_ten || !so_dien_thoai || !mat_khau_moi) throw loi.xau('Thieu thong tin')
  if (mat_khau_moi.length < 6) throw loi.xau('Mat khau phai co it nhat 6 ky tu')
  const result = await authService.quenMatKhauDan(cccd, ho_ten, so_dien_thoai, mat_khau_moi)
  ok(res, result)
}))

// Dat lai mat khau dan sau khi OTP da xac thuc (khong can auth)
router.patch('/dan/dat-lai-mat-khau-otp', asyncHandler(async (req, res) => {
  const { user_id, mat_khau_moi } = req.body
  if (!user_id) throw loi.xau('Thieu user_id')
  if (!mat_khau_moi || mat_khau_moi.length < 6) throw loi.xau('Mat khau moi phai co it nhat 6 ky tu')
  const result = await authService.datLaiMatKhauDan(user_id, mat_khau_moi)
  ok(res, result)
}))

router.post('/dan/dat-lai-mat-khau', authMiddleware, asyncHandler(async (req, res) => {
  const { mat_khau_moi } = req.body
  if (!mat_khau_moi) throw loi.xau('Thieu thong tin')
  if (mat_khau_moi.length < 6) throw loi.xau('Mat khau phai co it nhat 6 ky tu')
  const result = await authService.datLaiMatKhauDan(req.user.id, mat_khau_moi)
  ok(res, result)
}))

// Doi mat khau (dung chung dan/thon/xa khi DA CO mat khau)
router.patch('/doi-mat-khau', authMiddleware, asyncHandler(async (req, res) => {
  const { mat_khau_cu, mat_khau_moi } = req.body
  if (!mat_khau_cu) throw loi.xau('Vui long nhap mat khau cu')
  if (!mat_khau_moi || mat_khau_moi.length < 6) throw loi.xau('Mat khau moi phai co it nhat 6 ky tu')
  const result = await authService.doiMatKhau(req.user.id, mat_khau_cu, mat_khau_moi)
  ok(res, result)
}))

// Mock OTP gui cho dan khi thiet lap mat khau lan dau
router.post('/dan/gui-otp', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.vai_tro !== 'dan') throw loi.camTruyCap('Chi nguoi dan moi co the dung chuc nang nay')
  ok(res, { message: 'Da gui ma OTP', otp_mock: '123456' })
}))

// Thong tin nguoi dung hien tai
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await nguoiDungRepo.timTheoId(req.user.id)
  if (!user) throw loi.chuaDangNhap('Tai khoan khong ton tai')
  ok(res, { user: toUserResponse(user) })
}))

// Tu cap nhat thong tin ca nhan
router.patch('/me', authMiddleware, asyncHandler(async (req, res) => {
  const { ho_ten } = req.body
  if (!ho_ten || ho_ten.trim().length < 2) throw loi.xau('Ho ten phai co it nhat 2 ky tu')
  await nguoiDungRepo.capNhat(req.user.id, { ho_ten: ho_ten.trim() })
  const updated = await nguoiDungRepo.timTheoId(req.user.id)
  ok(res, { user: toUserResponse(updated) })
}))

// Upload avatar
router.post('/me/avatar', authMiddleware, avatarUpload.single('avatar'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) throw loi.xau('Thieu file anh')

    const user = await nguoiDungRepo.timTheoId(req.user.id)
    const ext = path.extname(req.file.originalname) || '.jpg'
    const storagePath = `user-${req.user.id}/${Date.now()}${ext}`

    const optimized = await optimizeImage(req.file.path, req.file.mimetype)

    const avatarUrl = await uploadAvatarToStorage(optimized.path, storagePath, optimized.mimetype)
    fs.unlinkSync(optimized.path)

    if (user.avatar_url) {
      await deleteAvatarFromStorage(user.avatar_url)
    }

    await nguoiDungRepo.capNhat(req.user.id, { avatar_url: avatarUrl })
    const updated = await nguoiDungRepo.timTheoId(req.user.id)
    ok(res, { user: toUserResponse(updated) })
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path) } catch { /* ignore */ }
    }
    throw err
  }
}))

// Lien ket email vao tai khoan can bo
router.patch('/me/email', authMiddleware, asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw loi.xau('Email khong hop le')
  const existing = await nguoiDungRepo.timTheoEmail(email)
  if (existing && existing.id !== req.user.id) throw loi.xau('Email nay da duoc su dung boi tai khoan khac')
  await nguoiDungRepo.capNhat(req.user.id, { email })
  const updated = await nguoiDungRepo.timTheoId(req.user.id)
  ok(res, { user: toUserResponse(updated) })
}))

// Lien ket so dien thoai vao tai khoan can bo
router.patch('/me/so-dien-thoai', authMiddleware, asyncHandler(async (req, res) => {
  const { so_dien_thoai } = req.body
  if (!so_dien_thoai || !/^0\d{9}$/.test(so_dien_thoai)) throw loi.xau('So dien thoai phai gom 10 chu so, bat dau bang 0')
  const existing = await nguoiDungRepo.timTheoSoDienThoai(so_dien_thoai, false)
  if (existing && existing.id !== req.user.id) throw loi.xau('So dien thoai nay da duoc su dung boi tai khoan khac')
  await nguoiDungRepo.capNhat(req.user.id, { so_dien_thoai })
  const updated = await nguoiDungRepo.timTheoId(req.user.id)
  ok(res, { user: toUserResponse(updated) })
}))

// Quen mat khau can bo - buoc 1: xac nhan tai khoan
router.post('/can-bo/quen-mat-khau', asyncHandler(async (req, res) => {
  const { tai_khoan } = req.body
  if (!tai_khoan) throw loi.xau('Thieu tai khoan')
  const result = await authService.quenMatKhauCanBo(tai_khoan)
  ok(res, { ...result, otp_mock: '123456' })
}))

// Quen mat khau can bo - buoc 2: dat lai mat khau
router.patch('/can-bo/dat-lai-mat-khau', asyncHandler(async (req, res) => {
  const { user_id, mat_khau_moi } = req.body
  if (!user_id) throw loi.xau('Thieu user_id')
  if (!mat_khau_moi || mat_khau_moi.length < 6) throw loi.xau('Mat khau moi phai co it nhat 6 ky tu')
  const result = await authService.datLaiMatKhauCanBo(user_id, mat_khau_moi)
  ok(res, result)
}))

// Liet ke phien dang nhap dang hoat dong
router.post('/sessions', authMiddleware, asyncHandler(async (req, res) => {
  const { refresh_token } = req.body
  const sessions = await refreshTokenRepo.layPhienHoatDong(req.user.id)

  let phienHienTaiId: number | null = null
  if (refresh_token) {
    const currentHash = hashToken(refresh_token)
    const match = sessions.find(s => s.token_hash === currentHash)
    if (match) phienHienTaiId = match.id
  }

  const result = sessions.map(s => {
    const parsed = parseUserAgent(s.user_agent)
    return {
      id: s.id,
      ten: parsed.ten,
      loai: parsed.loai,
      ip_address: s.ip_address,
      created_at: s.created_at,
    }
  })

  ok(res, { sessions: result, phien_hien_tai_id: phienHienTaiId })
}))

// Dang xuat 1 phien cu the
router.delete('/sessions/:id', authMiddleware, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) throw loi.xau('ID khong hop le')
  const success = await refreshTokenRepo.thuHoiTheoIdVaNguoiDung(id, req.user.id)
  if (!success) throw loi.khongThay('Khong tim thay phien')
  ok(res, { message: 'Da dang xuat phien' })
}))

// Dang xuat tat ca phien khac (tru phien hien tai)
router.post('/sessions/revoke-others', authMiddleware, asyncHandler(async (req, res) => {
  const { refresh_token } = req.body
  if (!refresh_token) throw loi.xau('Thieu refresh token')
  const currentHash = hashToken(refresh_token)
  const row = await refreshTokenRepo.timTheoHash(currentHash)
  if (!row || row.da_thu_hoi) throw loi.xau('Token khong hop le')
  if (row.nguoi_dung_id !== req.user.id) throw loi.camTruyCap('Khong co quyen')
  await refreshTokenRepo.thuHoiTatCaTru(req.user.id, row.id)
  ok(res, { message: 'Da dang xuat tat ca phien khac' })
}))

export default router
