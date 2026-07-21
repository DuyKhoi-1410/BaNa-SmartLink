// Service RAG: cau noi giua api va cac ham loi trong src/rag/
import { askStream } from '../rag/ragPipeline.js'
import { askDataStream } from '../rag/sqlAgent.js'
import { countChunks, listFiles } from '../rag/vectorStore.js'
import type { Response as ExpressRes } from 'express'

export interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

const SO_LIEU_KEYWORDS = /tổng|bao nhiêu|số lượng|thống kê|đếm|trung bình|so sánh|nhiều nhất|ít nhất|hộ nghèo|cận nghèo|nhân khẩu|lao động|bhyt|bảo trợ|có công|trẻ em|văn hóa|bạo lực|kê khai chưa|đã nộp|chưa nộp|trạng thái kê khai|đã duyệt|trả lại|tiến độ/i

function classifyLocal(cauHoi: string): 'so_lieu' | 'huong_dan' {
  return SO_LIEU_KEYWORDS.test(cauHoi) ? 'so_lieu' : 'huong_dan'
}

// Endpoint thong minh: tu phan loai cau hoi roi route
export async function askSmart(
  res: ExpressRes,
  cauHoi: string,
  vaiTro: string,
  userId?: number,
  thonId?: number,
  lichSu?: ChatMessage[]
): Promise<void> {
  const loai = classifyLocal(cauHoi)
  const fs = await import('fs')
  fs.appendFileSync('rag_debug.log', `[${new Date().toISOString()}] classify: ${JSON.stringify({ cauHoi, loai, vaiTro, userId, thonId })}\n`)
  if (loai === 'so_lieu') {
    return askDataStream(res, cauHoi, vaiTro, userId, thonId, lichSu)
  }
  return askStream(res, cauHoi, vaiTro, lichSu)
}

// Trang thai kho tri thuc
export async function status(): Promise<{ totalChunks: number; files: { file: string; count: number }[] }> {
  const [totalChunks, files] = await Promise.all([countChunks(), listFiles()])
  return { totalChunks, files }
}
