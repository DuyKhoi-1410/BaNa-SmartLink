import { query } from '../repositories/db.js'

export async function insertChunks(
  chunks: { noiDung: string; embedding: number[]; vaiTro: string; metadata: any }[]
): Promise<number> {
  let inserted = 0
  for (const chunk of chunks) {
    const embeddingStr = `[${chunk.embedding.join(',')}]`
    await query(
      `INSERT INTO tai_lieu_chunks (noi_dung, embedding, vai_tro, metadata)
       VALUES ($1, $2::vector, $3, $4)`,
      [chunk.noiDung, embeddingStr, chunk.vaiTro, JSON.stringify(chunk.metadata)]
    )
    inserted++
  }
  return inserted
}

export async function searchChunks(
  embedding: number[],
  vaiTro: string,
  topK: number
): Promise<{ noiDung: string; vaiTro: string; metadata: any; similarity: number }[]> {
  const embeddingStr = `[${embedding.join(',')}]`

  const result = await query(
    `SELECT noi_dung, vai_tro, metadata,
            1 - (embedding <=> $1::vector) AS similarity
     FROM tai_lieu_chunks
     WHERE vai_tro IN ($2, 'chung')
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [embeddingStr, vaiTro, topK]
  )

  return result.rows.map((r: any) => ({
    noiDung: r.noi_dung,
    vaiTro: r.vai_tro,
    metadata: r.metadata,
    similarity: parseFloat(r.similarity),
  }))
}

export async function clearChunks(): Promise<number> {
  const result = await query('DELETE FROM tai_lieu_chunks')
  return result.rowCount ?? 0
}

export async function countChunks(): Promise<number> {
  const result = await query('SELECT COUNT(*) AS total FROM tai_lieu_chunks')
  return parseInt(result.rows[0].total)
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
