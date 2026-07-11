import { query } from './db.js'

export async function layTheoKeKhaiHo(keKhaiHoId) {
  const result = await query(
    `SELECT * FROM minh_chung WHERE ke_khai_ho_id = $1 AND da_xoa = FALSE ORDER BY ma_chi_tieu, created_at DESC`,
    [keKhaiHoId]
  )
  return result.rows
}

export async function layTheoKeKhaiThon(keKhaiThonId) {
  const result = await query(
    `SELECT * FROM minh_chung WHERE ke_khai_thon_id = $1 AND da_xoa = FALSE ORDER BY ma_chi_tieu, created_at DESC`,
    [keKhaiThonId]
  )
  return result.rows
}

export async function layTheoChiTieu(keKhaiHoId, maChiTieu) {
  const result = await query(
    `SELECT * FROM minh_chung WHERE ke_khai_ho_id = $1 AND ma_chi_tieu = $2 AND da_xoa = FALSE ORDER BY created_at DESC`,
    [keKhaiHoId, maChiTieu]
  )
  return result.rows
}

export async function timTheoId(id) {
  const result = await query(`SELECT * FROM minh_chung WHERE id = $1`, [id])
  return result.rows[0] || null
}

export async function taoMoi(data) {
  const result = await query(
    `INSERT INTO minh_chung (ke_khai_ho_id, ke_khai_thon_id, ma_chi_tieu, file_url, file_name, file_size, loai_file, nguoi_upload_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.ke_khai_ho_id || null, data.ke_khai_thon_id || null, data.ma_chi_tieu, data.file_url, data.file_name, data.file_size || null, data.loai_file || null, data.nguoi_upload_id]
  )
  return result.rows[0]
}

export async function xoa(id) {
  const result = await query(
    `UPDATE minh_chung SET da_xoa = TRUE WHERE id = $1 RETURNING *`,
    [id]
  )
  return result.rows[0] || null
}
