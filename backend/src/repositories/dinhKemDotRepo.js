import { query } from './db.js'

export async function taoMoi(data) {
  const result = await query(
    `INSERT INTO dinh_kem_dot (dot_id, file_name, file_url, file_size, loai_file, mo_ta, nguoi_upload_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.dot_id, data.file_name, data.file_url, data.file_size, data.loai_file, data.mo_ta, data.nguoi_upload_id]
  )
  return result.rows[0]
}

export async function layTheoDot(dotId) {
  const result = await query(
    `SELECT dk.*, nd.ho_ten AS nguoi_upload
     FROM dinh_kem_dot dk
     LEFT JOIN nguoi_dung nd ON dk.nguoi_upload_id = nd.id
     WHERE dk.dot_id = $1 AND dk.da_xoa = FALSE
     ORDER BY dk.created_at DESC`,
    [dotId]
  )
  return result.rows
}

export async function timTheoId(id) {
  const result = await query(`SELECT * FROM dinh_kem_dot WHERE id = $1`, [id])
  return result.rows[0] || null
}

export async function xoa(id) {
  const result = await query(
    `UPDATE dinh_kem_dot SET da_xoa = TRUE WHERE id = $1 RETURNING *`,
    [id]
  )
  return result.rows[0] || null
}
