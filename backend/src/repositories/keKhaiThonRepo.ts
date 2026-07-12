import { query } from './db.js'

export async function timTheoDotVaThon(dotId, thonId) {
  const result = await query(
    `SELECT * FROM ke_khai_thon WHERE dot_id = $1 AND thon_id = $2`,
    [dotId, thonId]
  )
  return result.rows[0] || null
}

export async function layTheoDot(dotId) {
  const result = await query(
    `SELECT kt.*, t.ten_thon FROM ke_khai_thon kt JOIN thon t ON kt.thon_id = t.id WHERE kt.dot_id = $1 ORDER BY t.ten_thon`,
    [dotId]
  )
  return result.rows
}

export async function taoHoacCapNhat(data) {
  const existing = await timTheoDotVaThon(data.dot_id, data.thon_id)
  if (existing) {
    const result = await query(
      `UPDATE ke_khai_thon SET ct09_gia_dinh_van_hoa=$1, ct12_thanh_vien_to_cnsc=$2, ct13_huong_dan_dvc=$3, ct14_bao_luc_gia_dinh=$4, trang_thai='da_nhap', nguoi_nhap_id=$5, ngay_nhap=NOW(), updated_at=NOW() WHERE id=$6 RETURNING *`,
      [data.ct09_gia_dinh_van_hoa, data.ct12_thanh_vien_to_cnsc, data.ct13_huong_dan_dvc, data.ct14_bao_luc_gia_dinh, data.nguoi_nhap_id, existing.id]
    )
    return result.rows[0]
  }
  const result = await query(
    `INSERT INTO ke_khai_thon (dot_id, thon_id, ct09_gia_dinh_van_hoa, ct12_thanh_vien_to_cnsc, ct13_huong_dan_dvc, ct14_bao_luc_gia_dinh, trang_thai, nguoi_nhap_id, ngay_nhap) VALUES ($1,$2,$3,$4,$5,$6,'da_nhap',$7,NOW()) RETURNING *`,
    [data.dot_id, data.thon_id, data.ct09_gia_dinh_van_hoa, data.ct12_thanh_vien_to_cnsc, data.ct13_huong_dan_dvc, data.ct14_bao_luc_gia_dinh, data.nguoi_nhap_id]
  )
  return result.rows[0]
}

export async function nopLenXa(dotId, thonId) {
  const result = await query(
    `UPDATE ke_khai_thon SET trang_thai = 'da_nop_xa', updated_at = NOW() WHERE dot_id = $1 AND thon_id = $2 RETURNING *`,
    [dotId, thonId]
  )
  return result.rows[0]
}
