// Config RAG - load 1 lan tu env khi khoi dong du an
// Doi sang tunnel: chi sua RAG_BASE_URL + dien RAG_CF_ACCESS_* trong .env

export const RAG_CONFIG = {
  baseUrl: (process.env.RAG_BASE_URL || 'http://localhost:11434').replace(/\/$/, ''),
  chatModel: process.env.RAG_CHAT_MODEL || 'qwen3:8b',
  embeddingModel: process.env.RAG_EMBEDDING_MODEL || 'bge-m3',
  embeddingDim: parseInt(process.env.RAG_EMBEDDING_DIM || '1024'),
  cfAccessClientId: process.env.RAG_CF_ACCESS_CLIENT_ID || '',
  cfAccessClientSecret: process.env.RAG_CF_ACCESS_CLIENT_SECRET || '',
}

// Tham so pipeline
export const TOP_K = 4
export const MIN_SIMILARITY = 0.35
export const GENERATION_TEMPERATURE = 0
