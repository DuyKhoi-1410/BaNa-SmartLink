// Pipeline RAG: cau hoi -> embed -> tim chunk gan nhat -> stream tra loi
import { embedOne, generateStream } from './ollama.js'
import { searchChunks, countChunks } from './vectorStore.js'
import { TOP_K, MIN_SIMILARITY } from './config.js'
import type { Response as ExpressRes } from 'express'

function detectRepeat(text: string): boolean {
  if (text.length < 80) return false
  const len = text.length
  for (let patLen = 30; patLen <= Math.min(200, len / 2); patLen++) {
    const tail = text.slice(len - patLen)
    const prev = text.slice(len - patLen * 2, len - patLen)
    if (tail === prev) return true
  }
  return false
}

const KHONG_TIM_THAY =
  'Xin lỗi, tôi không tìm thấy thông tin liên quan trong tài liệu. Bạn có thể liên hệ cán bộ Thôn hoặc Tổ Công nghệ số cộng đồng để được hỗ trợ trực tiếp.'

function buildPrompt(context: string, question: string, lichSu: string): string {
  return `Bạn là trợ lý AI SmartLink. Nhiệm vụ duy nhất: trích dẫn lại nội dung từ tài liệu để trả lời câu hỏi.

## QUY TẮC BẮT BUỘC — VI PHẠM BẤT KỲ ĐIỀU NÀO LÀ SAI:
1. CHỈ sử dụng thông tin CÓ TRONG phần "Tài liệu tham khảo" bên dưới. Trích dẫn nguyên văn hoặc tóm tắt sát nghĩa.
2. TUYỆT ĐỐI KHÔNG thêm bước, thêm thông tin, suy luận, giải thích thêm hay bịa nội dung — kể cả khi bạn biết câu trả lời từ nguồn khác.
3. Nếu tài liệu KHÔNG chứa câu trả lời hoặc chỉ liên quan mờ nhạt, trả lời CHÍNH XÁC: "${KHONG_TIM_THAY}"
4. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
${lichSu ? `\n## Lịch sử trò chuyện gần đây:\n${lichSu}\n` : ''}
## Tài liệu tham khảo:
${context}

## Câu hỏi:
${question}

## Trả lời:`
}

function buildLichSu(lichSu?: { role: string; content: string }[]): string {
  if (!lichSu || lichSu.length === 0) return ''
  return lichSu
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'Người hỏi' : 'Trợ lý'}: ${m.content}`)
    .join('\n')
}

export async function askStream(
  res: ExpressRes,
  question: string,
  vaiTro: string,
  lichSu?: { role: string; content: string }[]
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const lsChuoi = buildLichSu(lichSu)

  let total: number
  try {
    total = await countChunks()
  } catch (err: any) {
    console.error('[RAG pipeline] DB error:', err.message)
    res.write(`data: ${JSON.stringify({ token: 'Không thể kết nối cơ sở dữ liệu. Vui lòng thử lại sau.', done: true, sources: [] })}\n\n`)
    res.end()
    return
  }

  if (total === 0) {
    res.write(`data: ${JSON.stringify({ token: 'Hệ thống chưa được nạp tài liệu hướng dẫn. Vui lòng liên hệ cán bộ xã để được hỗ trợ.' })}\n\n`)
    res.write(`data: ${JSON.stringify({ done: true, sources: [] })}\n\n`)
    res.end()
    return
  }

  let queryEmbedding: number[]
  try {
    queryEmbedding = await embedOne(question)
  } catch (err: any) {
    console.error('[RAG pipeline] Embedding error:', err.message)
    res.write(`data: ${JSON.stringify({ token: 'Hệ thống AI đang tạm ngưng. Vui lòng thử lại sau ít phút.', done: true, sources: [] })}\n\n`)
    res.end()
    return
  }

  const results = await searchChunks(queryEmbedding, vaiTro, TOP_K)
  const filtered = results.filter(r => r.similarity >= MIN_SIMILARITY)
  const coTaiLieu = filtered.length > 0
  console.log('[RAG pipeline]', { question, vaiTro, totalResults: results.length, filtered: filtered.length, topSimilarity: results[0]?.similarity, coTaiLieu })

  let sources: any[] = []

  if (!coTaiLieu) {
    res.write(`data: ${JSON.stringify({ token: KHONG_TIM_THAY })}\n\n`)
    res.write(`data: ${JSON.stringify({ done: true, sources: [] })}\n\n`)
    res.end()
    return
  }

  const context = filtered
    .map((r, i) => `--- Đoạn ${i + 1} [${r.metadata.section}, ${r.metadata.questionId}] ---\n${r.noiDung}`)
    .join('\n\n')
  const prompt = buildPrompt(context, question, lsChuoi)
  sources = filtered.map(r => ({
    file: r.metadata.file,
    section: r.metadata.section,
    questionId: r.metadata.questionId,
    similarity: Math.round(r.similarity * 1000) / 1000,
  }))

  let stream: NodeJS.ReadableStream
  try {
    stream = await generateStream(prompt)
  } catch (err: any) {
    console.error('[RAG pipeline] Generate stream error:', err.message)
    res.write(`data: ${JSON.stringify({ token: 'Hệ thống AI đang tạm ngưng. Vui lòng thử lại sau ít phút.', done: true, sources })}\n\n`)
    res.end()
    return
  }

  let buffer = ''
  let fullText = ''
  let stopped = false
  stream.on('data', (chunk: Buffer) => {
    if (stopped) return
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim() || stopped) continue
      try {
        const json = JSON.parse(line)
        if (json.response) {
          fullText += json.response
          if (detectRepeat(fullText)) {
            console.warn('[RAG pipeline] Detected repetition, stopping stream')
            stopped = true
            res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`)
            res.end()
            return
          }
          res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`)
        }
        if (json.done) {
          stopped = true
          res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`)
          res.end()
        }
      } catch {}
    }
  })

  stream.on('end', () => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`)
      res.end()
    }
  })

  stream.on('error', () => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ token: KHONG_TIM_THAY, done: true, sources: [] })}\n\n`)
      res.end()
    }
  })
}
