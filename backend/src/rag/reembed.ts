// Re-embed lai toan bo text da backup (179 chunk) bang bge-m3 -> nap vao bang moi 1024d.
// Chay 1 lan: npx tsx src/rag/reembed.ts
import 'dotenv/config'
import fs from 'fs'
import { embedOne } from './ollama.js'
import { insertChunks, countChunks } from './vectorStore.js'
import pool from '../repositories/db.js'

async function main() {
  const rows = JSON.parse(fs.readFileSync('backup_tai_lieu_chunks.json', 'utf8'))
  console.log(`Doc backup: ${rows.length} chunk`)

  const existing = await countChunks()
  if (existing > 0) {
    console.log(`Bang da co ${existing} dong - dung lai de tranh nhan doi. Xoa truoc neu muon chay lai.`)
    await pool.end()
    return
  }

  let done = 0
  for (const r of rows) {
    const embedding = await embedOne(r.noi_dung)
    await insertChunks([{ noiDung: r.noi_dung, embedding, vaiTro: r.vai_tro, metadata: r.metadata }])
    done++
    if (done % 20 === 0 || done === rows.length) console.log(`  ${done}/${rows.length}`)
  }

  const total = await countChunks()
  console.log(`\nDONE. Da nap ${done} chunk. Tong trong DB: ${total}`)
  await pool.end()
}

main().catch(async e => { console.error('ERR:', e.message); await pool.end(); process.exit(1) })
