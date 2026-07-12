import { query } from './db.js'

export interface RefreshTokenRow {
  id: number
  nguoi_dung_id: number
  token_hash: string
  het_han: Date
  da_thu_hoi: boolean
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

export async function taoMoi(data: {
  nguoi_dung_id: number
  token_hash: string
  het_han: Date
  ip_address?: string | null
  user_agent?: string | null
}): Promise<RefreshTokenRow> {
  const result = await query(
    `INSERT INTO refresh_token (nguoi_dung_id, token_hash, het_han, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.nguoi_dung_id, data.token_hash, data.het_han, data.ip_address || null, data.user_agent || null]
  )
  return result.rows[0]
}

export async function timTheoHash(tokenHash: string): Promise<RefreshTokenRow | null> {
  const result = await query(`SELECT * FROM refresh_token WHERE token_hash = $1`, [tokenHash])
  return result.rows[0] || null
}

export async function thuHoi(id: number): Promise<void> {
  await query(`UPDATE refresh_token SET da_thu_hoi = TRUE WHERE id = $1`, [id])
}

export async function thuHoiTheoHash(tokenHash: string): Promise<void> {
  await query(`UPDATE refresh_token SET da_thu_hoi = TRUE WHERE token_hash = $1`, [tokenHash])
}

// Thu hoi toan bo phien cua 1 nguoi dung (dung khi doi mat khau / khoa tai khoan)
export async function thuHoiTatCaCuaNguoiDung(nguoiDungId: number): Promise<void> {
  await query(`UPDATE refresh_token SET da_thu_hoi = TRUE WHERE nguoi_dung_id = $1 AND da_thu_hoi = FALSE`, [nguoiDungId])
}

// Don rac token het han / da thu hoi
export async function donRac(): Promise<void> {
  await query(`DELETE FROM refresh_token WHERE het_han < NOW() OR da_thu_hoi = TRUE`)
}
