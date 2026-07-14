import { query } from './db.js'

export async function layTheoKeKhaiHo(keKhaiHoId) {
  const result = await query(
    `SELECT * FROM minh_chung WHERE ke_khai_ho_id = $1 AND da_xoa = FALSE ORDER BY ma_chi_tieu, created_at DESC`,
    [keKhaiHoId]
  )
  return result.rows
}

export async function layTheoTatCaPhienBan(keKhaiHoId) {
  const result = await query(
    `SELECT mc.* FROM minh_chung mc
     JOIN ke_khai_ho kk ON mc.ke_khai_ho_id = kk.id
     WHERE kk.ho_dan_id = (SELECT ho_dan_id FROM ke_khai_ho WHERE id = $1)
       AND kk.dot_id = (SELECT dot_id FROM ke_khai_ho WHERE id = $1)
       AND mc.da_xoa = FALSE
     ORDER BY mc.ma_chi_tieu, mc.created_at DESC`,
    [keKhaiHoId]
  )
  return result.rows
}

export async function layTheoPhienBanMoiNhat(keKhaiHoId) {
  const result = await query(
    `SELECT mc.* FROM minh_chung mc
     WHERE mc.ke_khai_ho_id = (
       SELECT kk2.id FROM ke_khai_ho kk2
       WHERE kk2.ho_dan_id = (SELECT ho_dan_id FROM ke_khai_ho WHERE id = $1)
         AND kk2.dot_id = (SELECT dot_id FROM ke_khai_ho WHERE id = $1)
       ORDER BY kk2.phien_ban DESC LIMIT 1
     )
     AND mc.da_xoa = FALSE
     ORDER BY mc.ma_chi_tieu, mc.created_at DESC`,
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

// Lay minh chung kem thong tin quyen so huu (chu ho + thon) de chong IDOR
export async function timTheoIdKemQuyen(id) {
  const result = await query(
    `SELECT mc.*,
       hd_ho.chu_ho_id AS ho_chu_ho_id,
       hd_ho.thon_id AS ho_thon_id,
       kt.thon_id AS thon_thon_id
     FROM minh_chung mc
     LEFT JOIN ke_khai_ho kk ON mc.ke_khai_ho_id = kk.id
     LEFT JOIN ho_dan hd_ho ON kk.ho_dan_id = hd_ho.id
     LEFT JOIN ke_khai_thon kt ON mc.ke_khai_thon_id = kt.id
     WHERE mc.id = $1`,
    [id]
  )
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

export async function xoa(id, nguoiXoaId = null) {
  const result = await query(
    `UPDATE minh_chung SET da_xoa = TRUE, nguoi_xoa_id = $2, ngay_xoa = NOW() WHERE id = $1 RETURNING *`,
    [id, nguoiXoaId]
  )
  return result.rows[0] || null
}
