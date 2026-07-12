import { query } from './db.js'

export async function layTatCa() {
  const result = await query(`SELECT * FROM thon WHERE trang_thai = 'hoat_dong' ORDER BY ten_thon`)
  return result.rows
}

export async function timTheoId(id) {
  const result = await query(`SELECT * FROM thon WHERE id = $1`, [id])
  return result.rows[0] || null
}

export async function timTheoMa(maThon) {
  const result = await query(`SELECT * FROM thon WHERE ma_thon = $1`, [maThon])
  return result.rows[0] || null
}
