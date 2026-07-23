import { query, getClient } from './db.js'

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

export async function demTheoTatCaThon() {
  const result = await query(
    `SELECT t.id AS thon_id, t.ten_thon, COUNT(hd.id)::int AS tong_ho
     FROM thon t
     LEFT JOIN ho_dan hd ON hd.thon_id = t.id AND hd.trang_thai = 'dang_cu_tru'
     WHERE t.trang_thai = 'hoat_dong'
     GROUP BY t.id, t.ten_thon ORDER BY t.ten_thon`
  )
  return result.rows
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

// ===== QUAN LY NHAN KHAU (cap xa) =====

// Danh sach cho List View: CHI thong tin can de nhan dien (khong lo CCCD/SDT/dia chi)
export async function layDanhSachQuanLy(filter: { thon_id?: number; trang_thai?: string; tim_kiem?: string }) {
  let sql = `SELECT hd.id, hd.thon_id, hd.trang_thai, hd.ngay_roi, hd.created_at, hd.updated_at,
      nd.ho_ten AS ho_ten_chu_ho, nd.id AS chu_ho_id, t.ten_thon
    FROM ho_dan hd
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    WHERE 1=1`
  const params: any[] = []
  if (filter.thon_id) { params.push(filter.thon_id); sql += ` AND hd.thon_id = $${params.length}` }
  if (filter.trang_thai) { params.push(filter.trang_thai); sql += ` AND hd.trang_thai = $${params.length}` }
  if (filter.tim_kiem) { params.push(`%${filter.tim_kiem}%`); sql += ` AND nd.ho_ten ILIKE $${params.length}` }
  sql += ` ORDER BY t.ten_thon, nd.ho_ten`
  const result = await query(sql, params)
  return result.rows
}

// Chi tiet Detail View: lo day du CCCD/SDT/dia chi (goi kem ghi log truy cap)
export async function timChiTiet(id: number) {
  const result = await query(
    `SELECT hd.*, nd.ho_ten AS ho_ten_chu_ho, nd.cccd, nd.so_dien_thoai, nd.trang_thai AS trang_thai_tai_khoan,
       t.ten_thon, ncn.ho_ten AS nguoi_cap_nhat
    FROM ho_dan hd
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    LEFT JOIN nguoi_dung ncn ON hd.nguoi_cap_nhat_id = ncn.id
    WHERE hd.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

// Tao ho moi "chuyen den": tao nguoi_dung (chu ho) + ho_dan trong 1 transaction
export async function taoHoChuyenDen(data: {
  ho_ten: string
  cccd: string
  so_dien_thoai: string
  thon_id: number
  dia_chi?: string
  ghi_chu?: string
  mat_khau_hash?: string | null
}) {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const nd = await client.query(
      `INSERT INTO nguoi_dung (ho_ten, cccd, so_dien_thoai, vai_tro, thon_id, mat_khau_hash)
       VALUES ($1,$2,$3,'dan',$4,$5) RETURNING *`,
      [data.ho_ten, data.cccd, data.so_dien_thoai, data.thon_id, data.mat_khau_hash || null]
    )
    const chuHo = nd.rows[0]
    const hd = await client.query(
      `INSERT INTO ho_dan (chu_ho_id, thon_id, dia_chi, ghi_chu) VALUES ($1,$2,$3,$4) RETURNING *`,
      [chuHo.id, data.thon_id, data.dia_chi || null, data.ghi_chu || null]
    )
    await client.query('COMMIT')
    return { ho_dan: hd.rows[0], chu_ho: chuHo }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

// Danh dau ho "roi di" (KHONG xoa du lieu, chi doi trang thai + luu ngay/ly do/nguoi cap nhat)
export async function danhDauRoiDi(id: number, lyDo: string, nguoiCapNhatId: number) {
  const result = await query(
    `UPDATE ho_dan SET trang_thai = 'da_roi', ngay_roi = CURRENT_DATE, ly_do_roi = $2, nguoi_cap_nhat_id = $3
     WHERE id = $1 RETURNING *`,
    [id, lyDo || null, nguoiCapNhatId]
  )
  return result.rows[0] || null
}

// Cho ho quay lai cu tru
export async function choQuayLai(id: number, nguoiCapNhatId: number) {
  const result = await query(
    `UPDATE ho_dan SET trang_thai = 'dang_cu_tru', ngay_roi = NULL, ly_do_roi = NULL, nguoi_cap_nhat_id = $2
     WHERE id = $1 RETURNING *`,
    [id, nguoiCapNhatId]
  )
  return result.rows[0] || null
}

// Cap nhat thong tin lien lac ho (SDT, dia chi)
export async function capNhatThongTin(id: number, data: { so_dien_thoai?: string; dia_chi?: string; ghi_chu?: string }, chuHoId: number, nguoiCapNhatId: number) {
  if (data.so_dien_thoai !== undefined) {
    await query(`UPDATE nguoi_dung SET so_dien_thoai = $1 WHERE id = $2`, [data.so_dien_thoai, chuHoId])
  }
  const fields: string[] = []
  const params: any[] = []
  if (data.dia_chi !== undefined) { params.push(data.dia_chi); fields.push(`dia_chi = $${params.length}`) }
  if (data.ghi_chu !== undefined) { params.push(data.ghi_chu); fields.push(`ghi_chu = $${params.length}`) }
  params.push(nguoiCapNhatId); fields.push(`nguoi_cap_nhat_id = $${params.length}`)
  params.push(id)
  const result = await query(`UPDATE ho_dan SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params)
  return result.rows[0] || null
}
