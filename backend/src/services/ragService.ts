// Service RAG: cau noi giua api va cac ham loi trong src/rag/
import { askStream } from '../rag/ragPipeline.js'
import { askDataStream } from '../rag/sqlAgent.js'
import { countChunks, listFiles } from '../rag/vectorStore.js'
import type { Response as ExpressRes } from 'express'

export interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

const SO_LIEU_KEYWORDS = /tổng|tong|bao nhiêu|bao nhieu|số lượng|so luong|thống kê|thong ke|đếm|dem|trung bình|trung binh|so sánh|so sanh|nhiều nhất|nhieu nhat|ít nhất|it nhat|hộ nghèo|ho ngheo|cận nghèo|can ngheo|nhân khẩu|nhan khau|lao động|lao dong|bhyt|bảo trợ|bao tro|có công|co cong|trẻ em|tre em|văn hóa|van hoa|bạo lực|bao luc|kê khai chưa|ke khai chua|đã nộp|da nop|chưa nộp|chua nop|trạng thái kê khai|trang thai ke khai|đã duyệt|da duyet|trả lại|tra lai|tiến độ|tien do|danh sách|danh sach|sđt|sdt|số điện thoại|so dien thoai|điện thoại|dien thoai|cccd|căn cước|can cuoc|chủ hộ|chu ho|hộ dân|ho dan|người dân|nguoi dan|cán bộ|can bo|thôn nào|thon nao|mấy hộ|may ho|mấy người|may nguoi|đợt.*mở|dot.*mo|hạn.*kê khai|han.*ke khai|hết hạn|het han/i

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
