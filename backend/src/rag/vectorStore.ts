// Vector store tren Postgres/pgvector (bang tai_lieu_chunks, embedding 1024 chieu bge-m3)
import { query } from '../repositories/db.js'

export interface ChunkInput {
  noiDung: string
  embedding: number[]
  vaiTro: string
  metadata: Record<string, unknown>
}

export interface ChunkMatch {
  noiDung: string
  vaiTro: string
  metadata: any
  similarity: number
}

function toVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

export async function insertChunks(chunks: ChunkInput[]): Promise<number> {
  let inserted = 0
  for (const c of chunks) {
    await query(
      `INSERT INTO tai_lieu_chunks (noi_dung, embedding, vai_tro, metadata)
       VALUES ($1, $2::vector, $3, $4)`,
      [c.noiDung, toVector(c.embedding), c.vaiTro, JSON.stringify(c.metadata)]
    )
    inserted++
  }
  return inserted
}

// Tim chunk gan nhat theo cosine. Dan chi thay tai lieu vai tro cua minh + 'chung'.
export async function searchChunks(embedding: number[], vaiTro: string, topK: number): Promise<ChunkMatch[]> {
  const result = await query(
    `SELECT noi_dung, vai_tro, metadata,
            1 - (embedding <=> $1::vector) AS similarity
     FROM tai_lieu_chunks
     WHERE vai_tro IN ($2, 'chung')
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [toVector(embedding), vaiTro, topK]
  )
  return result.rows.map((r: any) => ({
    noiDung: r.noi_dung,
    vaiTro: r.vai_tro,
    metadata: r.metadata,
    similarity: parseFloat(r.similarity),
  }))
}

export async function countChunks(): Promise<number> {
  const result = await query('SELECT COUNT(*) AS total FROM tai_lieu_chunks')
  return parseInt(result.rows[0].total)
}

export async function clearChunks(): Promise<number> {
  const result = await query('DELETE FROM tai_lieu_chunks')
  return result.rowCount ?? 0
}

export async function listFiles(): Promise<{ file: string; count: number }[]> {
  const result = await query(
    `SELECT metadata->>'file' AS file, COUNT(*) AS count
     FROM tai_lieu_chunks
     GROUP BY metadata->>'file'
     ORDER BY file`
  )
  return result.rows.map((r: any) => ({ file: r.file, count: parseInt(r.count) }))
}
