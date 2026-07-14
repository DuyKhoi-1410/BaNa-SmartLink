import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authMiddleware } from '../middleware/auth.js'
import * as minhChungRepo from '../repositories/minhChungRepo.js'
import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import { query } from '../repositories/db.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
const BUCKET = 'minh-chung'

const TEMP_DIR = path.join(process.cwd(), 'uploads', '_temp')
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true })

const CT_DAN = ['CT02', 'CT03', 'CT04', 'CT05', 'CT06', 'CT08', 'CT11']
const CT_THON = ['CT09', 'CT12', 'CT13', 'CT14']
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Chi chap nhan anh (JPEG, PNG, WebP, HEIC) hoac PDF'))
    }
    cb(null, true)
  },
})

async function uploadToStorage(filePath: string, storagePath: string, mimetype: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
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
    throw new Error(`Upload that bai: ${err}`)
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

async function deleteFromStorage(fileUrl: string) {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
  if (!fileUrl.startsWith(prefix)) return
  const storagePath = fileUrl.slice(prefix.length)
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
  })
}

const router = Router()

// Xoa file: ho tro ca Supabase URL moi va /uploads/ cu
async function xoaFile(fileUrl: string) {
  try {
    if (fileUrl?.startsWith(`${SUPABASE_URL}/`)) {
      await deleteFromStorage(fileUrl)
    }
  } catch (e: any) {
    console.error('[evidence] Khong xoa duoc file:', e.message)
  }
}

// Kiem tra quyen truy cap minh chung theo vai tro (chong IDOR)
async function kiemTraQuyen(user: any, mc: any) {
  if (user.vai_tro === 'xa') return // xa xem/xoa duoc tat ca
  if (mc.ke_khai_ho_id) {
    // Minh chung cua ho: dan chi duoc ho cua minh, thon chi duoc thon cua minh
    if (user.vai_tro === 'dan' && mc.ho_chu_ho_id !== user.id) {
      throw loi.camTruyCap('Khong the truy cap minh chung cua ho khac')
    }
    if (user.vai_tro === 'thon' && mc.ho_thon_id !== user.thon_id) {
      throw loi.camTruyCap('Khong the truy cap minh chung ngoai thon cua ban')
    }
  } else if (mc.ke_khai_thon_id) {
    // Minh chung cua thon: chi thon so huu (dan khong duoc)
    if (user.vai_tro === 'dan') throw loi.camTruyCap('Khong co quyen truy cap')
    if (user.vai_tro === 'thon' && mc.thon_thon_id !== user.thon_id) {
      throw loi.camTruyCap('Khong the truy cap minh chung ngoai thon cua ban')
    }
  }
}

router.post('/', authMiddleware, upload.single('file'), asyncHandler(async (req, res) => {
  try {
    const { ke_khai_ho_id, ke_khai_thon_id, ma_chi_tieu } = req.body

    if (!ma_chi_tieu) throw loi.xau('Thieu ma chi tieu')
    if (!ke_khai_ho_id && !ke_khai_thon_id) throw loi.xau('Thieu ke_khai_ho_id hoac ke_khai_thon_id')
    if (ke_khai_ho_id && !CT_DAN.includes(ma_chi_tieu.toUpperCase())) {
      throw loi.xau(`Chi tieu ${ma_chi_tieu} khong can minh chung cua dan`)
    }
    if (ke_khai_thon_id && !CT_THON.includes(ma_chi_tieu.toUpperCase())) {
      throw loi.xau(`Chi tieu ${ma_chi_tieu} khong can minh chung cua thon`)
    }
    if (!req.file) throw loi.xau('Thieu file minh chung')

    if (ke_khai_ho_id) {
      const kk = await keKhaiHoRepo.timTheoId(parseInt(ke_khai_ho_id))
      if (!kk) throw loi.khongThay('Khong tim thay ke khai ho')
    }
    if (ke_khai_thon_id) {
      const check = await query('SELECT id FROM ke_khai_thon WHERE id = $1', [parseInt(ke_khai_thon_id)])
      if (check.rows.length === 0) throw loi.khongThay('Khong tim thay ke khai thon')
    }

    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const ext = path.extname(fileName) || '.jpg'
    const folder = ke_khai_ho_id ? `ho-${ke_khai_ho_id}` : `thon-${ke_khai_thon_id}`
    const storagePath = `${folder}/${ma_chi_tieu.toUpperCase()}_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`

    const fileUrl = await uploadToStorage(req.file.path, storagePath, req.file.mimetype)

    fs.unlinkSync(req.file.path)

    const minhChung = await minhChungRepo.taoMoi({
      ke_khai_ho_id: ke_khai_ho_id ? parseInt(ke_khai_ho_id) : null,
      ke_khai_thon_id: ke_khai_thon_id ? parseInt(ke_khai_thon_id) : null,
      ma_chi_tieu: ma_chi_tieu.toUpperCase(),
      file_url: fileUrl,
      file_name: fileName,
      file_size: req.file.size,
      loai_file: req.file.mimetype,
      nguoi_upload_id: req.user.id,
    })

    ok(res, minhChung, 201)
  } catch (err) {
    // Cleanup file temp khi upload loi (tranh rac trong _temp)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path) } catch { /* ignore */ }
    }
    throw err
  }
}))

router.get('/ke-khai-ho/:keKhaiHoId', authMiddleware, asyncHandler(async (req, res) => {
  const keKhaiHoId = parseInt(req.params.keKhaiHoId)
  if (req.user.vai_tro !== 'xa') {
    const kk = await keKhaiHoRepo.timTheoId(keKhaiHoId)
    if (!kk) throw loi.khongThay('Khong tim thay ke khai ho')
    if (req.user.vai_tro === 'dan' && kk.nguoi_ke_khai_id !== req.user.id) {
      throw loi.camTruyCap('Khong the truy cap minh chung cua ho khac')
    }
    if (req.user.vai_tro === 'thon' && kk.thon_id !== req.user.thon_id) {
      throw loi.camTruyCap('Khong the truy cap minh chung ngoai thon cua ban')
    }
  }
  const rows = await minhChungRepo.layTheoPhienBanMoiNhat(keKhaiHoId)
  ok(res, rows)
}))

router.get('/ke-khai-thon/:keKhaiThonId', authMiddleware, asyncHandler(async (req, res) => {
  const keKhaiThonId = parseInt(req.params.keKhaiThonId)
  if (req.user.vai_tro === 'dan') throw loi.camTruyCap('Khong co quyen truy cap')
  if (req.user.vai_tro === 'thon') {
    const check = await query('SELECT thon_id FROM ke_khai_thon WHERE id = $1', [keKhaiThonId])
    if (check.rows.length === 0) throw loi.khongThay('Khong tim thay ke khai thon')
    if (check.rows[0].thon_id !== req.user.thon_id) {
      throw loi.camTruyCap('Khong the truy cap minh chung ngoai thon cua ban')
    }
  }
  const rows = await minhChungRepo.layTheoKeKhaiThon(keKhaiThonId)
  ok(res, rows)
}))

router.get('/ke-khai-ho/:keKhaiHoId/:maChiTieu', authMiddleware, asyncHandler(async (req, res) => {
  const keKhaiHoId = parseInt(req.params.keKhaiHoId)
  if (req.user.vai_tro !== 'xa') {
    const kk = await keKhaiHoRepo.timTheoId(keKhaiHoId)
    if (!kk) throw loi.khongThay('Khong tim thay ke khai ho')
    if (req.user.vai_tro === 'dan' && kk.nguoi_ke_khai_id !== req.user.id) {
      throw loi.camTruyCap('Khong the truy cap minh chung cua ho khac')
    }
    if (req.user.vai_tro === 'thon' && kk.thon_id !== req.user.thon_id) {
      throw loi.camTruyCap('Khong the truy cap minh chung ngoai thon cua ban')
    }
  }
  const rows = await minhChungRepo.layTheoChiTieu(keKhaiHoId, req.params.maChiTieu.toUpperCase())
  ok(res, rows)
}))

router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  // Get-before-delete + check quyen so huu (chong IDOR)
  const mc = await minhChungRepo.timTheoIdKemQuyen(parseInt(req.params.id))
  if (!mc) throw loi.khongThay('Khong tim thay minh chung')
  if (mc.da_xoa) throw loi.khongThay('Minh chung da duoc xoa truoc do')

  await kiemTraQuyen(req.user, mc)

  // Xoa mem trong DB (giu lich su) + xoa file vat ly
  await minhChungRepo.xoa(mc.id, req.user.id)
  await xoaFile(mc.file_url)

  ok(res, { message: 'Da xoa minh chung' })
}))

export default router
