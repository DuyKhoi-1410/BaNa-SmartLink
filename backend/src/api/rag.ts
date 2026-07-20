// Route RAG. Base: /api/v1/rag. Validate input + goi ragService + tra envelope {success,data}
import { Router } from 'express'
import type { Request } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { asyncHandler, ok, loi } from '../utils/response.js'
import * as ragService from '../services/ragService.js'

const router = Router()

function layCauHoi(req: Request): string {
  const { cauHoi } = req.body ?? {}
  if (!cauHoi || typeof cauHoi !== 'string' || cauHoi.trim().length < 2) {
    throw loi.xau('Vui lòng nhập câu hỏi')
  }
  return cauHoi.trim()
}

// Hoi tai lieu huong dan (RAG) - moi vai tro
router.post('/ask', authMiddleware, asyncHandler(async (req, res) => {
  const data = await ragService.ask(layCauHoi(req), req.user?.vai_tro || 'dan')
  ok(res, data)
}))

// Hoi so lieu (SQL agent) - chi can bo xa
router.post('/ask-data', authMiddleware, requireRole('xa'), asyncHandler(async (req, res) => {
  const data = await ragService.askData(layCauHoi(req))
  ok(res, data)
}))

// Trang thai kho tri thuc
router.get('/status', authMiddleware, asyncHandler(async (_req, res) => {
  const data = await ragService.status()
  ok(res, data)
}))

export default router
