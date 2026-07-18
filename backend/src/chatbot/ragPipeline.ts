import { embedQuery, generateAnswer } from './gemini.js'
import { searchChunks, countChunks } from './vectorStore.js'
import { TOP_K } from './config.js'

export interface AskResult {
  answer: string
  sources: { file: string; section: string; questionId: string; similarity: number }[]
}

export async function ask(question: string, vaiTro: string): Promise<AskResult> {
  const total = await countChunks()
  if (total === 0) {
    return {
      answer: 'Hệ thống chưa được nạp tài liệu hướng dẫn. Vui lòng liên hệ cán bộ xã để được hỗ trợ.',
      sources: [],
    }
  }

  const queryEmbedding = await embedQuery(question)
  const results = await searchChunks(queryEmbedding, vaiTro, TOP_K)

  if (results.length === 0 || results[0].similarity < 0.3) {
    return {
      answer: 'Xin lỗi, tôi không tìm thấy thông tin liên quan trong tài liệu. Bạn có thể liên hệ cán bộ Thôn hoặc Tổ Công nghệ số cộng đồng để được hỗ trợ trực tiếp.',
      sources: [],
    }
  }

  const context = results
    .map((r, i) => `--- Đoạn ${i + 1} [${r.metadata.section}, ${r.metadata.questionId}] ---\n${r.noiDung}`)
    .join('\n\n')

  const answer = await generateAnswer(context, question)

  const sources = results.map(r => ({
    file: r.metadata.file,
    section: r.metadata.section,
    questionId: r.metadata.questionId,
    similarity: Math.round(r.similarity * 1000) / 1000,
  }))

  return { answer, sources }
}
