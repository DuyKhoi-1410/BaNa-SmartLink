import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
})

pool.on('error', (err) => {
  console.error('DB pool error:', err.message)
})

export async function query(text, params) {
  const result = await pool.query(text, params)
  return result
}

export async function getClient() {
  return pool.connect()
}

export default pool
