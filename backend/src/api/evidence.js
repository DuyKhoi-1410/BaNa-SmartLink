import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authMiddleware } from '../middleware/auth.js'
import * as minhChungRepo from '../repositories/minhChungRepo.js'
import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import { query } from '../repositories/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const CT_DAN = ['CT02', 'CT03', 'CT04', 'CT05', 'CT06', 'CT08', 'CT11']
const CT_THON = ['CT09', 'CT12', 'CT13', 'CT14']
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const TEMP_DIR = path.join(UPLOADS_DIR, '_temp')
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, TEMP_DIR)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Chi chap nhan anh (JPEG, PNG, WebP, HEIC) hoac PDF'))
    }
    cb(null, true)
  },
})

const router = Router()

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { ke_khai_ho_id, ke_khai_thon_id, ma_chi_tieu } = req.body

    if (!ma_chi_tieu) {
      return res.status(400).json({ error: 'Thieu ma chi tieu' })
    }
    if (!ke_khai_ho_id && !ke_khai_thon_id) {
      return res.status(400).json({ error: 'Thieu ke_khai_ho_id hoac ke_khai_thon_id' })
    }
    if (ke_khai_ho_id && !CT_DAN.includes(ma_chi_tieu.toUpperCase())) {
      return res.status(400).json({ error: `Chi tieu ${ma_chi_tieu} khong can minh chung cua dan` })
    }
    if (ke_khai_thon_id && !CT_THON.includes(ma_chi_tieu.toUpperCase())) {
      return res.status(400).json({ error: `Chi tieu ${ma_chi_tieu} khong can minh chung cua thon` })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Thieu file minh chung' })
    }

    if (ke_khai_ho_id) {
      const kk = await keKhaiHoRepo.timTheoId(parseInt(ke_khai_ho_id))
      if (!kk) return res.status(404).json({ error: 'Khong tim thay ke khai ho' })
    }
    if (ke_khai_thon_id) {
      const check = await query('SELECT id FROM ke_khai_thon WHERE id = $1', [parseInt(ke_khai_thon_id)])
      if (check.rows.length === 0) return res.status(404).json({ error: 'Khong tim thay ke khai thon' })
    }

    const finalDir = ke_khai_ho_id
      ? path.join(UPLOADS_DIR, 'ho', String(ke_khai_ho_id))
      : path.join(UPLOADS_DIR, 'thon', String(ke_khai_thon_id))
    fs.mkdirSync(finalDir, { recursive: true })

    const ext = path.extname(req.file.originalname) || '.jpg'
    const finalName = `${ma_chi_tieu.toUpperCase()}_${Date.now()}${ext}`
    const finalPath = path.join(finalDir, finalName)
    fs.renameSync(req.file.path, finalPath)

    const relativePath = path.relative(UPLOADS_DIR, finalPath).replace(/\\/g, '/')
    const fileUrl = `/uploads/${relativePath}`

    const minhChung = await minhChungRepo.taoMoi({
      ke_khai_ho_id: ke_khai_ho_id ? parseInt(ke_khai_ho_id) : null,
      ke_khai_thon_id: ke_khai_thon_id ? parseInt(ke_khai_thon_id) : null,
      ma_chi_tieu: ma_chi_tieu.toUpperCase(),
      file_url: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
      loai_file: req.file.mimetype,
      nguoi_upload_id: req.user.id,
    })

    res.status(201).json(minhChung)
  } catch (err) {
    if (err.message?.includes('Chi chap nhan')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

router.get('/ke-khai-ho/:keKhaiHoId', authMiddleware, async (req, res) => {
  try {
    const rows = await minhChungRepo.layTheoKeKhaiHo(parseInt(req.params.keKhaiHoId))
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/ke-khai-thon/:keKhaiThonId', authMiddleware, async (req, res) => {
  try {
    const rows = await minhChungRepo.layTheoKeKhaiThon(parseInt(req.params.keKhaiThonId))
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/ke-khai-ho/:keKhaiHoId/:maChiTieu', authMiddleware, async (req, res) => {
  try {
    const rows = await minhChungRepo.layTheoChiTieu(
      parseInt(req.params.keKhaiHoId),
      req.params.maChiTieu.toUpperCase()
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const mc = await minhChungRepo.timTheoId(parseInt(req.params.id))
    if (!mc) return res.status(404).json({ error: 'Khong tim thay minh chung' })
    if (mc.da_xoa) return res.status(404).json({ error: 'Minh chung da duoc xoa truoc do' })

    await minhChungRepo.xoa(mc.id)
    res.json({ message: 'Da xoa minh chung' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
