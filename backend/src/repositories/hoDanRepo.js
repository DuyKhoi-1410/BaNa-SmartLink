import { query } from './db.js'

export async function layTheoThon(thonId, trangThai) {
  let sql = `SELECT hd.*, nd.ho_ten AS ho_ten_chu_ho, t.ten_thon
    FROM ho_dan hd
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    WHERE hd.thon_id = $1`
  const params = [thonId]
  if (trangThai) { params.push(trangThai); sql += ` AND hd.trang_thai = $${params.length}` }
  sql += ` ORDER BY nd.ho_ten`
  const result = await query(sql, params)
  return result.rows
}

export async function timTheoId(id) {
  const result = await query(
    `SELECT hd.*, nd.ho_ten AS ho_ten_chu_ho, nd.cccd, nd.so_dien_thoai, t.ten_thon
    FROM ho_dan hd
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    WHERE hd.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export async function timTheoChuHo(chuHoId) {
  const result = await query(
    `SELECT hd.*, nd.ho_ten AS ho_ten_chu_ho, t.ten_thon
    FROM ho_dan hd
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    WHERE hd.chu_ho_id = $1`,
    [chuHoId]
  )
  return result.rows[0] || null
}

export async function taoMoi(data) {
  const result = await query(
    `INSERT INTO ho_dan (chu_ho_id, thon_id, dia_chi, ghi_chu) VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.chu_ho_id, data.thon_id, data.dia_chi, data.ghi_chu]
  )
  return result.rows[0]
}

export async function capNhatTrangThai(id, trangThai) {
  const result = await query(
    `UPDATE ho_dan SET trang_thai = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [trangThai, id]
  )
  return result.rows[0]
}

export async function demTheoThon(thonId) {
  const result = await query(
    `SELECT COUNT(*) AS tong FROM ho_dan WHERE thon_id = $1 AND trang_thai = 'dang_cu_tru'`,
    [thonId]
  )
  return parseInt(result.rows[0].tong)
}

export async function layTatCa() {
  const result = await query(
    `SELECT hd.*, nd.ho_ten AS ho_ten_chu_ho, t.ten_thon
    FROM ho_dan hd
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    ORDER BY t.ten_thon, nd.ho_ten`
  )
  return result.rows
}
