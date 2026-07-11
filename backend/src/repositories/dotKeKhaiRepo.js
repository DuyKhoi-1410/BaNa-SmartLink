import { query } from './db.js'

export async function layTatCa() {
  const result = await query(`SELECT * FROM dot_ke_khai ORDER BY created_at DESC`)
  return result.rows
}

export async function timTheoId(id) {
  const result = await query(`SELECT * FROM dot_ke_khai WHERE id = $1`, [id])
  return result.rows[0] || null
}

export async function layDangMo() {
  const result = await query(`SELECT * FROM dot_ke_khai WHERE trang_thai = 'dang_mo' ORDER BY ngay_ket_thuc ASC`)
  return result.rows
}

export async function taoMoi(data) {
  const result = await query(
    `INSERT INTO dot_ke_khai (ten_dot, mo_ta, loai, quy, nam, ngay_bat_dau, ngay_ket_thuc, nguoi_tao_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.ten_dot, data.mo_ta, data.loai, data.quy, data.nam, data.ngay_bat_dau, data.ngay_ket_thuc, data.nguoi_tao_id]
  )
  return result.rows[0]
}

export async function capNhatTrangThai(id, trangThai) {
  const result = await query(
    `UPDATE dot_ke_khai SET trang_thai = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [trangThai, id]
  )
  return result.rows[0]
}
