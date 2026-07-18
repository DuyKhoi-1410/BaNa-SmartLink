// Nap tai lieu PDF vao vector store. Chay tay: npx tsx src/rag/ingestPdf.ts <path-to-pdf>
// Luu y: MAC DINH XOA het chunk cu roi nap moi (chi giu 1 bo tai lieu tai 1 thoi diem).
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
import { chunkPdfQA } from './chunker.js'
import { embedMany } from './ollama.js'
import { insertChunks, clearChunks, countChunks } from './vectorStore.js'
import pool from '../repositories/db.js'

async function ingest() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx tsx src/rag/ingestPdf.ts <path-to-pdf>')
    process.exit(1)
  }

  const fullPath = path.resolve(filePath)
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`)
    process.exit(1)
  }

  const fileName = path.basename(fullPath)
  console.log(`\n=== Ingesting: ${fileName} ===\n`)

  try {
    const buffer = fs.readFileSync(fullPath)
    const data = await pdfParse(buffer)
    console.log(`Pages: ${data.numpages}, Text length: ${data.text.length} chars`)

    const chunks = chunkPdfQA(data.text, fileName)
    console.log(`Chunks created: ${chunks.length}`)
    if (chunks.length === 0) {
      console.error('No chunks extracted. Check PDF content.')
      process.exit(1)
    }

    console.log(`\nEmbedding ${chunks.length} chunks...`)
    const embeddings = await embedMany(chunks.map(c => c.noiDung))

    const oldCount = await countChunks()
    if (oldCount > 0) {
      console.log(`Clearing ${oldCount} old chunks...`)
      await clearChunks()
    }

    const inserted = await insertChunks(chunks.map((c, i) => ({
      noiDung: c.noiDung,
      embedding: embeddings[i],
      vaiTro: c.vaiTro,
      metadata: c.metadata,
    })))
    console.log(`\nDone! Inserted ${inserted} chunks. Total in DB: ${await countChunks()}`)
  } catch (err: any) {
    console.error('Ingest error:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

ingest()
