// Controller RAG: validate input, goi ragService, tra ve envelope chuan {success,data}
import type { Request, Response } from 'express'
import { ok, loi } from '../utils/response.js'
import * as ragService from '../services/ragService.js'

function layCauHoi(req: Request): string {
  const { cauHoi } = req.body ?? {}
  if (!cauHoi || typeof cauHoi !== 'string' || cauHoi.trim().length < 2) {
    throw loi.xau('Vui lòng nhập câu hỏi')
  }
  return cauHoi.trim()
}

// POST /rag/ask - hoi tai lieu huong dan (moi vai tro)
export async function ask(req: Request, res: Response) {
  const cauHoi = layCauHoi(req)
  const vaiTro = req.user?.vai_tro || 'dan'
  const data = await ragService.hoiTaiLieu(cauHoi, vaiTro)
  ok(res, data)
}

// POST /rag/ask-data - hoi so lieu (chi xa)
export async function askData(req: Request, res: Response) {
  const cauHoi = layCauHoi(req)
  const data = await ragService.hoiSoLieu(cauHoi)
  ok(res, data)
}

// GET /rag/status - trang thai kho tri thuc
export async function status(_req: Request, res: Response) {
  const data = await ragService.trangThai()
  ok(res, data)
}
