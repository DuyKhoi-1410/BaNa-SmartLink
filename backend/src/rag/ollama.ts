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
