// Route RAG (mong): path + middleware -> controller. Base: /api/v1/rag
import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../utils/response.js'
import * as ragController from '../controllers/ragController.js'

const router = Router()

router.post('/ask', authMiddleware, asyncHandler(ragController.ask))
router.post('/ask-data', authMiddleware, requireRole('xa'), asyncHandler(ragController.askData))
router.get('/status', authMiddleware, asyncHandler(ragController.status))

export default router
