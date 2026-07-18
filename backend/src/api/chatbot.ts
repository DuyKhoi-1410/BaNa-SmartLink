import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { ask } from '../chatbot/ragPipeline.js'
import { askData } from '../chatbot/sqlAgent.js'
import { listFiles, countChunks } from '../chatbot/vectorStore.js'

const router = Router()

router.post('/ask', authMiddleware, async (req, res) => {
  try {
    const { cauHoi } = req.body
    if (!cauHoi || typeof cauHoi !== 'string' || cauHoi.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Vui long nhap cau hoi' },
      })
    }

    const vaiTro = req.user?.vai_tro || 'dan'
    const result = await ask(cauHoi.trim(), vaiTro)

    res.json({ success: true, data: result })
  } catch (err: any) {
    console.error('Chatbot ask error:', err.message)
    res.status(500).json({
      success: false,
      error: { code: 'CHATBOT_ERROR', message: 'Loi xu ly chatbot' },
    })
  }
})

router.post('/ask-data', authMiddleware, requireRole('xa'), async (req, res) => {
  try {
    const { cauHoi } = req.body
    if (!cauHoi || typeof cauHoi !== 'string' || cauHoi.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Vui long nhap cau hoi' },
      })
    }

    const result = await askData(cauHoi.trim())
    res.json({ success: true, data: result })
  } catch (err: any) {
    console.error('Chatbot ask-data error:', err.message)
    res.status(500).json({
      success: false,
      error: { code: 'CHATBOT_ERROR', message: 'Loi xu ly truy van du lieu' },
    })
  }
})

router.get('/status', authMiddleware, async (_req, res) => {
  try {
    const total = await countChunks()
    const files = await listFiles()
    res.json({ success: true, data: { totalChunks: total, files } })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CHATBOT_ERROR', message: err.message },
    })
  }
})

export default router
