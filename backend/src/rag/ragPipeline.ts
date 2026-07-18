// Pipeline RAG: cau hoi -> embed -> tim chunk gan nhat -> qwen3 tra loi theo tai lieu
import { embedOne, generate } from './ollama.js'
import { searchChunks, countChunks } from './vectorStore.js'
import { TOP_K, MIN_SIMILARITY } from './config.js'

export interface AskResult {
  answer: string
  sources: { file: string; section: string; questionId: string; similarity: number }[]
}

const KHONG_TIM_THAY =
  'Xin lỗi, tôi không tìm thấy thông tin liên quan trong tài liệu. Bạn có thể liên hệ cán bộ Thôn hoặc Tổ Công nghệ số cộng đồng để được hỗ trợ trực tiếp.'

function buildPrompt(context: string, question: string): string {
  return `Bạn là trợ lý AI SmartLink, chuyên hỗ trợ người dân và cán bộ xã/thôn về hệ thống kê khai dữ liệu Văn hóa - Xã hội.
Hãy trả lời câu hỏi CHỈ dựa trên các đoạn tài liệu được cung cấp bên dưới.
Nếu tài liệu không chứa thông tin để trả lời, hãy trả lời đúng câu: "${KHONG_TIM_THAY}"
Trả lời bằng tiếng Việt, rõ ràng, thân thiện và dễ hiểu cho bà con. Không bịa thông tin ngoài tài liệu.

## Tài liệu tham khảo:
${context}

## Câu hỏi:
${question}

## Trả lời:`
}

export async function ask(question: string, vaiTro: string): Promise<AskResult> {
  const total = await countChunks()
  if (total === 0) {
    return {
      answer: 'Hệ thống chưa được nạp tài liệu hướng dẫn. Vui lòng liên hệ cán bộ xã để được hỗ trợ.',
      sources: [],
    }
  }

  const queryEmbedding = await embedOne(question)
  const results = await searchChunks(queryEmbedding, vaiTro, TOP_K)

  if (results.length === 0 || results[0].similarity < MIN_SIMILARITY) {
    return { answer: KHONG_TIM_THAY, sources: [] }
  }

  const context = results
    .map((r, i) => `--- Đoạn ${i + 1} [${r.metadata.section}, ${r.metadata.questionId}] ---\n${r.noiDung}`)
    .join('\n\n')

  const answer = await generate(buildPrompt(context, question))

  const sources = results.map(r => ({
    file: r.metadata.file,
    section: r.metadata.section,
    questionId: r.metadata.questionId,
    similarity: Math.round(r.similarity * 1000) / 1000,
  }))

  return { answer: answer || KHONG_TIM_THAY, sources }
}
