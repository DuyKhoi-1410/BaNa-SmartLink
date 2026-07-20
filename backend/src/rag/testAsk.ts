// Test nhanh pipeline RAG + SQL agent (khong can chay server)
import 'dotenv/config'
import { ask, askData } from '../services/ragService.js'
import pool from '../repositories/db.js'

async function main() {
  console.log('===== TEST RAG (hoi tai lieu, vai tro dan) =====\n')
  for (const q of ['Làm sao để kê khai?', 'Tôi quên mật khẩu thì làm thế nào?']) {
    console.log('HOI:', q)
    const r = await ask(q, 'dan')
    console.log('DAP:', r.answer)
    console.log('Nguon:', r.sources.map(s => `${s.section}/${s.questionId}(${s.similarity})`).join(', '))
    console.log('---')
  }

  console.log('\n===== TEST SQL AGENT (hoi so lieu, vai tro xa) =====\n')
  for (const q of ['Tổng số hộ nghèo toàn xã là bao nhiêu?', 'Số nhân khẩu theo từng thôn?']) {
    console.log('HOI:', q)
    const r = await askData(q)
    console.log('DAP:', r.answer)
    if (r.sql) console.log('SQL:', r.sql)
    console.log('---')
  }

  await pool.end()
}

main().catch(async e => { console.error('ERR:', e.message); await pool.end(); process.exit(1) })
