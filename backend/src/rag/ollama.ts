// Client Ollama (thay Gemini). Ho tro CF Access header de sau goi qua Cloudflare tunnel.
import { RAG_CONFIG, GENERATION_TEMPERATURE } from './config.js'

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (RAG_CONFIG.cfAccessClientId && RAG_CONFIG.cfAccessClientSecret) {
    h['CF-Access-Client-Id'] = RAG_CONFIG.cfAccessClientId
    h['CF-Access-Client-Secret'] = RAG_CONFIG.cfAccessClientSecret
  }
  return h
}

async function postJson(path: string, body: unknown, timeoutMs: number): Promise<any> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${RAG_CONFIG.baseUrl}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Ollama ${path} HTTP ${res.status}: ${text.slice(0, 200)}`)
    }
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

// Embed 1 doan text -> vector (bge-m3, 1024 chieu)
export async function embedOne(text: string): Promise<number[]> {
  const data = await postJson('/api/embed', { model: RAG_CONFIG.embeddingModel, input: text }, 60_000)
  const vec = data.embeddings?.[0]
  if (!Array.isArray(vec)) throw new Error('Ollama embed: khong nhan duoc vector')
  return vec
}

// Embed nhieu doan lan luot (Ollama xu ly tuan tu, tranh qua tai)
export async function embedMany(texts: string[]): Promise<number[][]> {
  const out: number[][] = []
  for (let i = 0; i < texts.length; i++) {
    out.push(await embedOne(texts[i]))
    if ((i + 1) % 20 === 0) console.log(`  Embedded ${i + 1}/${texts.length}`)
  }
  return out
}

// Sinh cau tra loi (qwen3:8b). Tat che do thinking de tra loi thang, nhanh hon.
export async function generate(prompt: string): Promise<string> {
  const data = await postJson('/api/generate', {
    model: RAG_CONFIG.chatModel,
    prompt,
    stream: false,
    think: false,
    options: { temperature: GENERATION_TEMPERATURE },
  }, 120_000)
  return (data.response ?? '').trim()
}

// Stream sinh cau tra loi, tra ve NodeJS.ReadableStream tu Ollama
export async function generateStream(prompt: string): Promise<NodeJS.ReadableStream> {
  const http = await import('http')
  const https = await import('https')
  const url = new URL(`${RAG_CONFIG.baseUrl}/api/generate`)
  const isHttps = url.protocol === 'https:'
  const reqModule = isHttps ? https : http

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: RAG_CONFIG.chatModel,
      prompt,
      stream: true,
      think: false,
      options: { temperature: GENERATION_TEMPERATURE },
    })

    const hdrs: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body).toString(),
    }
    const cfHeaders = headers()
    if (cfHeaders['CF-Access-Client-Id']) {
      hdrs['CF-Access-Client-Id'] = cfHeaders['CF-Access-Client-Id']
      hdrs['CF-Access-Client-Secret'] = cfHeaders['CF-Access-Client-Secret']
    }

    const req = reqModule.request({
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: hdrs,
    }, (res) => {
      if (res.statusCode !== 200) {
        let errBody = ''
        res.on('data', c => errBody += c)
        res.on('end', () => reject(new Error(`Ollama stream HTTP ${res.statusCode}: ${errBody.slice(0, 200)}`)))
        return
      }
      resolve(res)
    })

    req.setTimeout(120_000, () => { req.destroy(); reject(new Error('Ollama stream timeout')) })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// Phan loai nhanh: cau hoi la "so_lieu" (query DB) hay "huong_dan" (tim tai lieu)
export async function classify(question: string): Promise<'so_lieu' | 'huong_dan'> {
  const prompt = `Phân loại câu hỏi sau thuộc loại nào. Chỉ trả lời đúng 1 từ: "so_lieu" hoặc "huong_dan".

- "so_lieu": câu hỏi về số liệu, thống kê, đếm, tổng, trung bình, so sánh dữ liệu (ví dụ: "tổng hộ nghèo?", "bao nhiêu nhân khẩu thôn 3?", "thôn nào nhiều trẻ nhất?")
- "huong_dan": câu hỏi về cách sử dụng, thao tác, hướng dẫn, quy trình (ví dụ: "làm sao kê khai?", "cách đăng nhập?", "quên mật khẩu?")

Câu hỏi: "${question}"
Trả lời:`

  const answer = await generate(prompt)
  return answer.toLowerCase().includes('so_lieu') ? 'so_lieu' : 'huong_dan'
}
