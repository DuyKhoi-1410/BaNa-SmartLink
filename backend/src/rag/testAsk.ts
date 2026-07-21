// Test nhanh Ollama connection + classify (khong can chay server)
import 'dotenv/config'
import { generate, classify, embedOne } from './ollama.js'
import { searchChunks, countChunks } from './vectorStore.js'
import pool from '../repositories/db.js'

async function main() {
  console.log('===== TEST OLLAMA CONNECTION =====\n')
  const total = await countChunks()
  console.log('Total chunks:', total)

  console.log('\n===== TEST CLASSIFY =====\n')
  for (const q of ['Tổng hộ nghèo?', 'Làm sao kê khai?', 'Số nhân khẩu thôn 3?', 'Quên mật khẩu?']) {
    const loai = await classify(q)
    console.log(`"${q}" -> ${loai}`)
  }

  console.log('\n===== TEST EMBED + SEARCH =====\n')
  const vec = await embedOne('Làm sao kê khai?')
  console.log('Vector dim:', vec.length)
  const results = await searchChunks(vec, 'dan', 3)
  console.log('Top 3:', results.map(r => `${r.metadata.questionId}(${r.similarity.toFixed(3)})`).join(', '))

  await pool.end()
}

main().catch(async e => { console.error('ERR:', e.message); await pool.end(); process.exit(1) })
