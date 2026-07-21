import { query } from './db.js'

export async function layTheoNguoiNhan(nguoiNhanId, limit = 50) {
  const result = await query(
    `SELECT tb.*, nd.ho_ten AS ten_nguoi_gui FROM thong_bao tb LEFT JOIN nguoi_dung nd ON tb.nguoi_gui_id = nd.id WHERE tb.nguoi_nhan_id = $1 ORDER BY tb.created_at DESC LIMIT $2`,
    [nguoiNhanId, limit]
  )
  return result.rows
}

export async function layTheoThon(thonId, limit = 50) {
  const result = await query(
    `SELECT tb.*, nd.ho_ten AS ten_nguoi_gui FROM thong_bao tb LEFT JOIN nguoi_dung nd ON tb.nguoi_gui_id = nd.id WHERE tb.thon_id = $1 ORDER BY tb.created_at DESC LIMIT $2`,
    [thonId, limit]
  )
  return result.rows
}

export async function taoMoi(data) {
  const result = await query(
    `INSERT INTO thong_bao (tieu_de, noi_dung, loai, nguoi_gui_id, nguoi_nhan_id, thon_id, dot_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.tieu_de, data.noi_dung, data.loai || 'he_thong', data.nguoi_gui_id, data.nguoi_nhan_id, data.thon_id, data.dot_id]
  )
  return result.rows[0]
}

export async function danhDauDaDoc(id) {
  const result = await query(`UPDATE thong_bao SET da_doc = TRUE WHERE id = $1 RETURNING *`, [id])
  return result.rows[0]
}

export async function danhDauTatCaDaDoc(nguoiNhanId) {
  const result = await query(
    `UPDATE thong_bao SET da_doc = TRUE WHERE nguoi_nhan_id = $1 AND da_doc = FALSE`,
    [nguoiNhanId]
  )
  return result.rowCount
}

export async function danhDauTatCaDaDocTheoThon(thonId) {
  const result = await query(
    `UPDATE thong_bao SET da_doc = TRUE WHERE thon_id = $1 AND da_doc = FALSE`,
    [thonId]
  )
  return result.rowCount
}

export async function demChuaDoc(nguoiNhanId) {
  const result = await query(
    `SELECT COUNT(*) AS so_chua_doc FROM thong_bao WHERE nguoi_nhan_id = $1 AND da_doc = FALSE`,
    [nguoiNhanId]
  )
  return parseInt(result.rows[0].so_chua_doc)
}

export async function demChuaDocTheoThon(thonId) {
  const result = await query(
    `SELECT COUNT(*) AS so_chua_doc FROM thong_bao WHERE thon_id = $1 AND da_doc = FALSE`,
    [thonId]
  )
  return parseInt(result.rows[0].so_chua_doc)
}

export async function taoNhieu(danhSach) {
  if (!danhSach.length) return []
  const values = []
  const placeholders = []
  let idx = 1
  for (const tb of danhSach) {
    placeholders.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6})`)
    values.push(tb.tieu_de, tb.noi_dung, tb.loai || 'he_thong', tb.nguoi_gui_id || null, tb.nguoi_nhan_id || null, tb.thon_id || null, tb.dot_id || null)
    idx += 7
  }
  const result = await query(
    `INSERT INTO thong_bao (tieu_de, noi_dung, loai, nguoi_gui_id, nguoi_nhan_id, thon_id, dot_id) VALUES ${placeholders.join(',')} RETURNING *`,
    values
  )
  return result.rows
}

export async function daGuiThongBao(dotId, loai, nguoiNhanId, thonId) {
  let sql = `SELECT COUNT(*) AS cnt FROM thong_bao WHERE dot_id = $1 AND loai = $2`
  const params = [dotId, loai]
  if (nguoiNhanId) { params.push(nguoiNhanId); sql += ` AND nguoi_nhan_id = $${params.length}` }
  if (thonId) { params.push(thonId); sql += ` AND thon_id = $${params.length}` }
  const result = await query(sql, params)
  return parseInt(result.rows[0].cnt) > 0
}
