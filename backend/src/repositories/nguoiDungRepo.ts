import { query } from './db.js'

export async function timTheoCccd(cccd) {
  const result = await query(
    `SELECT nd.*, t.ten_thon FROM nguoi_dung nd LEFT JOIN thon t ON nd.thon_id = t.id WHERE nd.cccd = $1`,
    [cccd]
  )
  return result.rows[0] || null
}

export async function timTheoTenDangNhap(tenDangNhap) {
  const result = await query(
    `SELECT nd.*, t.ten_thon FROM nguoi_dung nd LEFT JOIN thon t ON nd.thon_id = t.id WHERE nd.ten_dang_nhap = $1`,
    [tenDangNhap]
  )
  return result.rows[0] || null
}

export async function timTheoEmail(email) {
  const result = await query(
    `SELECT nd.*, t.ten_thon FROM nguoi_dung nd LEFT JOIN thon t ON nd.thon_id = t.id WHERE nd.email = $1`,
    [email]
  )
  return result.rows[0] || null
}

export async function timTheoSoDienThoai(soDienThoai, chiCanBo = false) {
  let sql = `SELECT nd.*, t.ten_thon FROM nguoi_dung nd LEFT JOIN thon t ON nd.thon_id = t.id WHERE nd.so_dien_thoai = $1`
  if (chiCanBo) sql += ` AND nd.vai_tro IN ('thon','xa')`
  const result = await query(sql, [soDienThoai])
  return result.rows[0] || null
}

export async function timTheoId(id) {
  const result = await query(
    `SELECT nd.*, t.ten_thon FROM nguoi_dung nd LEFT JOIN thon t ON nd.thon_id = t.id WHERE nd.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export async function layDanhSach(vaiTro, thonId, trangThai) {
  let sql = `SELECT nd.*, t.ten_thon FROM nguoi_dung nd LEFT JOIN thon t ON nd.thon_id = t.id WHERE 1=1`
  const params = []
  if (vaiTro) { params.push(vaiTro); sql += ` AND nd.vai_tro = $${params.length}` }
  if (thonId) { params.push(thonId); sql += ` AND nd.thon_id = $${params.length}` }
  if (trangThai) { params.push(trangThai); sql += ` AND nd.trang_thai = $${params.length}` }
  sql += ` ORDER BY nd.ho_ten`
  const result = await query(sql, params)
  return result.rows
}

export async function taoMoi(data) {
  const result = await query(
    `INSERT INTO nguoi_dung (ho_ten, cccd, so_dien_thoai, vai_tro, thon_id, ten_dang_nhap, mat_khau_hash) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.ho_ten, data.cccd, data.so_dien_thoai, data.vai_tro, data.thon_id, data.ten_dang_nhap, data.mat_khau_hash]
  )
  return result.rows[0]
}

export async function capNhat(id, data) {
  const fields = []
  const values = []
  let idx = 1
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push(val)
      idx++
    }
  }
  if (fields.length === 0) return null
  fields.push(`updated_at = NOW()`)
  values.push(id)
  const result = await query(`UPDATE nguoi_dung SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values)
  return result.rows[0]
}
