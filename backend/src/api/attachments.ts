import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import * as dinhKemDotRepo from '../repositories/dinhKemDotRepo.js'
import { asyncHandler, ok, loi } from '../utils/response.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
const BUCKET = 'dinh-kem'

const TEMP_DIR = path.join(process.cwd(), 'uploads', '_temp')
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true })

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg', 'image/png', 'image/webp',
    ]
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Chi chap nhan PDF, Word, Excel hoac anh'))
    }
    cb(null, true)
  },
})

async function uploadToStorage(filePath, storagePath, mimetype) {
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

async function deleteFromStorage(fileUrl) {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
  if (!fileUrl.startsWith(prefix)) return
  const storagePath = fileUrl.slice(prefix.length)
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
  })
}

const router = Router()

router.post('/:dotId', authMiddleware, requireRole('xa'), upload.single('file'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) throw loi.xau('Thieu file')

    const dotId = parseInt(req.params.dotId)
    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const ext = path.extname(fileName) || ''
    const storagePath = `dot-${dotId}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`

    const fileUrl = await uploadToStorage(req.file.path, storagePath, req.file.mimetype)

    fs.unlinkSync(req.file.path)

    const record = await dinhKemDotRepo.taoMoi({
      dot_id: dotId,
      file_name: fileName,
      file_url: fileUrl,
      file_size: req.file.size,
      loai_file: req.file.mimetype,
      mo_ta: req.body.mo_ta || '',
      nguoi_upload_id: req.user.id,
    })

    ok(res, record, 201)
  } catch (err) {
    // Cleanup temp khi loi
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path) } catch { /* ignore */ }
    }
    throw err
  }
}))

router.get('/:dotId', authMiddleware, requireRole('xa', 'thon'), asyncHandler(async (req, res) => {
  const rows = await dinhKemDotRepo.layTheoDot(parseInt(req.params.dotId))
  ok(res, rows)
}))

router.delete('/file/:id', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  // Get-before-delete
  const record = await dinhKemDotRepo.timTheoId(parseInt(req.params.id))
  if (!record) throw loi.khongThay('Khong tim thay file')
  if (record.da_xoa) throw loi.khongThay('File da duoc xoa truoc do')

  // Xoa mem DB (giu lich su) + xoa file that tren Supabase Storage
  await dinhKemDotRepo.xoa(record.id, req.user.id)
  await deleteFromStorage(record.file_url)

  ok(res, { message: 'Da xoa file' })
}))

export default router
