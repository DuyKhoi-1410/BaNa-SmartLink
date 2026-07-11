import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import * as dinhKemDotRepo from '../repositories/dinhKemDotRepo.js'

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

router.post('/:dotId', authMiddleware, requireRole('xa'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Thieu file' })

    const dotId = parseInt(req.params.dotId)
    const ext = path.extname(req.file.originalname) || ''
    const storagePath = `dot-${dotId}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`

    const fileUrl = await uploadToStorage(req.file.path, storagePath, req.file.mimetype)

    fs.unlinkSync(req.file.path)

    const record = await dinhKemDotRepo.taoMoi({
      dot_id: dotId,
      file_name: req.file.originalname,
      file_url: fileUrl,
      file_size: req.file.size,
      loai_file: req.file.mimetype,
      mo_ta: req.body.mo_ta || '',
      nguoi_upload_id: req.user.id,
    })

    res.status(201).json(record)
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    if (err.message?.includes('Chi chap nhan')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

router.get('/:dotId', authMiddleware, requireRole('xa', 'thon'), async (req, res) => {
  try {
    const rows = await dinhKemDotRepo.layTheoDot(parseInt(req.params.dotId))
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/file/:id', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const record = await dinhKemDotRepo.timTheoId(parseInt(req.params.id))
    if (!record) return res.status(404).json({ error: 'Khong tim thay file' })
    if (record.da_xoa) return res.status(404).json({ error: 'File da duoc xoa truoc do' })

    await dinhKemDotRepo.xoa(record.id)

    res.json({ message: 'Da xoa file' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
