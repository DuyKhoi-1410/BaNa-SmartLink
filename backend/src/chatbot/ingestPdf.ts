import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
import { chunkPdfQA } from './chunker.js'
import { embedTexts } from './gemini.js'
import { insertChunks, clearChunks, countChunks } from './vectorStore.js'
import pool from '../repositories/db.js'

async function ingest() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx tsx src/chatbot/ingestPdf.ts <path-to-pdf>')
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
    // 1. Extract text from PDF
    const buffer = fs.readFileSync(fullPath)
    const data = await pdfParse(buffer)
    console.log(`Pages: ${data.numpages}`)
    console.log(`Text length: ${data.text.length} chars`)

    // 2. Chunk by Q&A
    const chunks = chunkPdfQA(data.text, fileName)
    console.log(`\nChunks created: ${chunks.length}`)

    const roleCount: Record<string, number> = {}
    for (const c of chunks) {
      roleCount[c.vaiTro] = (roleCount[c.vaiTro] || 0) + 1
    }
    console.log('By role:', JSON.stringify(roleCount))

    if (chunks.length === 0) {
      console.error('No chunks extracted. Check PDF content.')
      process.exit(1)
    }

    // 3. Embed all chunks
    console.log(`\nEmbedding ${chunks.length} chunks...`)
    const texts = chunks.map(c => c.noiDung)
    const embeddings = await embedTexts(texts)
    console.log(`Embeddings generated: ${embeddings.length}`)

    // 4. Clear old data and insert new
    const oldCount = await countChunks()
    if (oldCount > 0) {
      console.log(`Clearing ${oldCount} old chunks...`)
      await clearChunks()
    }

    console.log('Inserting into pgvector...')
    const vectorData = chunks.map((c, i) => ({
      noiDung: c.noiDung,
      embedding: embeddings[i],
      vaiTro: c.vaiTro,
      metadata: c.metadata,
    }))
    const inserted = await insertChunks(vectorData)
    console.log(`\nDone! Inserted ${inserted} chunks into tai_lieu_chunks.`)

    const finalCount = await countChunks()
    console.log(`Total chunks in DB: ${finalCount}`)
  } catch (err: any) {
    console.error('Ingest error:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

ingest()
