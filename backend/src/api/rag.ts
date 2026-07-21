// Route RAG. Base: /api/v1/rag
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler, ok, loi } from '../utils/response.js'
import * as ragService from '../services/ragService.js'

const router = Router()

// Endpoint thong nhat: tu phan loai + stream response
router.post('/ask', authMiddleware, async (req, res) => {
  try {
    const fs = await import('fs')
    fs.appendFileSync('rag_debug.log', `[${new Date().toISOString()}] /ask hit, user: ${JSON.stringify(req.user?.vai_tro)}, body: ${JSON.stringify(req.body?.cauHoi?.slice(0, 50))}\n`)
    const { cauHoi, lichSu } = req.body ?? {}
    if (!cauHoi || typeof cauHoi !== 'string' || cauHoi.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Vui lòng nhập câu hỏi' },
      })
    }

    const vaiTro = req.user?.vai_tro || 'dan'
    const userId = req.user?.id as number | undefined
    const thonId = req.user?.thon_id as number | undefined
    await ragService.askSmart(res, cauHoi.trim(), vaiTro, userId, thonId, lichSu)
  } catch (err: any) {
    console.error('RAG ask error:', err.message)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message },
      })
    }
  }
})

// Trang thai kho tri thuc
router.get('/status', authMiddleware, asyncHandler(async (_req, res) => {
  const data = await ragService.status()
  ok(res, data)
}))

export default router
