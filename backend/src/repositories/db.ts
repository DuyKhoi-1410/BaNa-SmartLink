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

// Tra ve rows kieu any de tang linh hoat (pragmatic) - tang phai check bang DTO
export async function query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number | null }> {
  const result = await pool.query(text, params)
  return result as any
}

export async function getClient() {
  return pool.connect()
}

export default pool
