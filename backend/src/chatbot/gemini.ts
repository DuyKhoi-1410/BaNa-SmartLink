import { GoogleGenAI } from '@google/genai'
import { EMBEDDING_MODEL, GENERATION_MODEL, BATCH_SIZE, GENERATION_TEMPERATURE } from './config.js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

async function embedSingle(text: string, taskType: string): Promise<number[]> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const result = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: { taskType } as any,
      })
      return (result as any).embedding?.values ?? (result as any).embeddings?.[0]?.values ?? []
    } catch (err: any) {
      const msg = err?.message ?? JSON.stringify(err)
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        const delay = Math.pow(2, attempt) * 5000
        console.log(`  Rate limited, waiting ${delay / 1000}s...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      if (attempt < 4) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
  return []
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const results: number[][] = []
  const batchSize = 5
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const embeddings: number[][] = []
    for (const t of batch) {
      embeddings.push(await embedSingle(t, 'RETRIEVAL_DOCUMENT'))
    }
    results.push(...embeddings)
    console.log(`  Embedded ${Math.min(i + batchSize, texts.length)}/${texts.length}`)
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return results
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedSingle(text, 'RETRIEVAL_QUERY')
}

export async function generateAnswer(context: string, question: string): Promise<string> {
  const prompt = `Bạn là trợ lý AI SmartLink, chuyên hỗ trợ người dân và cán bộ xã/thôn về hệ thống kê khai dữ liệu Văn hóa - Xã hội.
Hãy trả lời câu hỏi CHỈ dựa trên các đoạn tài liệu được cung cấp bên dưới.
Nếu tài liệu không chứa thông tin để trả lời, hãy trả lời: "Xin lỗi, tôi không tìm thấy thông tin về vấn đề này trong tài liệu. Bạn có thể liên hệ cán bộ Thôn hoặc Tổ Công nghệ số cộng đồng để được hỗ trợ trực tiếp."
Trả lời bằng tiếng Việt, rõ ràng, thân thiện và dễ hiểu cho bà con.

## Tài liệu tham khảo:
${context}

## Câu hỏi:
${question}

## Trả lời:`

  const response = await ai.models.generateContent({
    model: GENERATION_MODEL,
    contents: prompt,
    config: { temperature: GENERATION_TEMPERATURE } as any,
  })

  return (response as any).text ?? ''
}
