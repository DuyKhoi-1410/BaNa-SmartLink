import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { query } from './repositories/db.js'
import pool from './repositories/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function migrate() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema', 'migration.sql'), 'utf8')
    await query(sql)
    console.log('Migration completed successfully')
  } catch (err) {
    console.error('Migration error:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
