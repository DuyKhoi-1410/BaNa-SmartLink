import { query } from './db.js'

export async function layTheoDot(dotId, thonId) {
  let innerWhere = `kk.dot_id = $1`
  const params = [dotId]
  if (thonId) { params.push(thonId); innerWhere += ` AND hd.thon_id = $${params.length}` }
  const sql = `SELECT * FROM (
    SELECT DISTINCT ON (kk.ho_dan_id) kk.*, nd.ho_ten AS ho_ten_chu_ho, t.ten_thon, hd.thon_id
    FROM ke_khai_ho kk
    JOIN ho_dan hd ON kk.ho_dan_id = hd.id
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    WHERE ${innerWhere}
    ORDER BY kk.ho_dan_id, kk.phien_ban DESC
  ) sub ORDER BY ho_ten_chu_ho`
  const result = await query(sql, params)
  return result.rows
}

export async function timTheoId(id) {
  const result = await query(
    `SELECT kk.*, nd.ho_ten AS ho_ten_chu_ho, t.ten_thon, hd.thon_id
    FROM ke_khai_ho kk
    JOIN ho_dan hd ON kk.ho_dan_id = hd.id
    JOIN nguoi_dung nd ON hd.chu_ho_id = nd.id
    JOIN thon t ON hd.thon_id = t.id
    WHERE kk.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export async function timTheoHoDanVaDot(hoDanId, dotId) {
  const result = await query(
    `SELECT * FROM ke_khai_ho WHERE ho_dan_id = $1 AND dot_id = $2 ORDER BY phien_ban DESC LIMIT 1`,
    [hoDanId, dotId]
  )
  return result.rows[0] || null
}

export async function layTheoChuHo(chuHoId) {
  const result = await query(
    `SELECT kk.*, dk.ten_dot, dk.loai, dk.quy, dk.nam, dk.ngay_bat_dau, dk.ngay_ket_thuc, dk.trang_thai AS trang_thai_dot
    FROM ke_khai_ho kk
    JOIN ho_dan hd ON kk.ho_dan_id = hd.id
    JOIN dot_ke_khai dk ON kk.dot_id = dk.id
    WHERE hd.chu_ho_id = $1
    ORDER BY kk.ngay_ke_khai DESC`,
    [chuHoId]
  )
  return result.rows
}

export async function taoMoi(data) {
  const result = await query(
    `INSERT INTO ke_khai_ho (dot_id, ho_dan_id, phien_ban, ct02_tong_nhan_khau, ct03_ho_ngheo, ct04_ho_can_ngheo, ct05_nguoi_co_cong, ct06_bao_tro_xh, ct07_tre_duoi_16, ct08_tre_hoan_canh, ct10_tuoi_lao_dong, ct11_tham_gia_bhyt, trang_thai, nguoi_ke_khai_id, ngay_ke_khai)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW()) RETURNING *`,
    [data.dot_id, data.ho_dan_id, data.phien_ban || 1, data.ct02_tong_nhan_khau, data.ct03_ho_ngheo, data.ct04_ho_can_ngheo, data.ct05_nguoi_co_cong, data.ct06_bao_tro_xh, data.ct07_tre_duoi_16, data.ct08_tre_hoan_canh, data.ct10_tuoi_lao_dong, data.ct11_tham_gia_bhyt, data.trang_thai || 'da_ke_khai', data.nguoi_ke_khai_id]
  )
  return result.rows[0]
}

export async function duyetKeKhai(id, nguoiDuyetId) {
  const result = await query(
    `UPDATE ke_khai_ho SET trang_thai = 'da_duyet', nguoi_duyet_id = $1, ngay_duyet = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`,
    [nguoiDuyetId, id]
  )
  return result.rows[0]
}

export async function traLaiKeKhai(id, nguoiDuyetId, lyDo, chiTieuTraLai?) {
  const result = await query(
    `UPDATE ke_khai_ho SET trang_thai = 'tra_lai', nguoi_duyet_id = $1, ly_do_tra_lai = $2, chi_tieu_tra_lai = $3, ngay_duyet = NOW(), updated_at = NOW() WHERE id = $4 RETURNING *`,
    [nguoiDuyetId, lyDo, chiTieuTraLai ? JSON.stringify(chiTieuTraLai) : null, id]
  )
  return result.rows[0]
}

export async function tienDoTatCaThon(dotId) {
  const result = await query(
    `SELECT t.id AS thon_id, t.ten_thon,
      COUNT(hd.id) AS tong_ho,
      COUNT(kk.id) FILTER (WHERE kk.trang_thai IS NOT NULL AND kk.trang_thai != 'chua_ke_khai') AS da_ke_khai,
      COUNT(kk.id) FILTER (WHERE kk.trang_thai = 'da_duyet') AS da_duyet,
      COUNT(kk.id) FILTER (WHERE kk.trang_thai = 'tra_lai') AS tra_lai
    FROM thon t
    LEFT JOIN ho_dan hd ON hd.thon_id = t.id AND hd.trang_thai = 'dang_cu_tru'
    LEFT JOIN LATERAL (
      SELECT id, trang_thai FROM ke_khai_ho WHERE ho_dan_id = hd.id AND dot_id = $1 ORDER BY phien_ban DESC LIMIT 1
    ) kk ON TRUE
    WHERE t.trang_thai = 'hoat_dong'
    GROUP BY t.id, t.ten_thon
    ORDER BY t.ten_thon`,
    [dotId]
  )
  return result.rows
}

export async function tongHopTatCaThon(dotId) {
  const result = await query(
    `SELECT t.id AS thon_id, t.ten_thon,
      COUNT(DISTINCT hd.id) AS ct01_tong_ho,
      COALESCE(SUM(kk.ct02_tong_nhan_khau), 0) AS ct02_tong_nhan_khau,
      COALESCE(SUM(kk.ct03_ho_ngheo), 0) AS ct03_ho_ngheo,
      COALESCE(SUM(kk.ct04_ho_can_ngheo), 0) AS ct04_ho_can_ngheo,
      COALESCE(SUM(kk.ct05_nguoi_co_cong), 0) AS ct05_nguoi_co_cong,
      COALESCE(SUM(kk.ct06_bao_tro_xh), 0) AS ct06_bao_tro_xh,
      COALESCE(SUM(kk.ct07_tre_duoi_16), 0) AS ct07_tre_duoi_16,
      COALESCE(SUM(kk.ct08_tre_hoan_canh), 0) AS ct08_tre_hoan_canh,
      COALESCE(SUM(kk.ct10_tuoi_lao_dong), 0) AS ct10_tuoi_lao_dong,
      COALESCE(SUM(kk.ct11_tham_gia_bhyt), 0) AS ct11_tham_gia_bhyt
    FROM thon t
    LEFT JOIN ho_dan hd ON hd.thon_id = t.id AND hd.trang_thai = 'dang_cu_tru'
    LEFT JOIN ke_khai_ho kk ON hd.id = kk.ho_dan_id AND kk.dot_id = $1 AND kk.trang_thai = 'da_duyet'
    WHERE t.trang_thai = 'hoat_dong'
    GROUP BY t.id, t.ten_thon
    ORDER BY t.ten_thon`,
    [dotId]
  )
  return result.rows
}

export async function tienDoThon(dotId, thonId) {
  const result = await query(
    `SELECT
      COUNT(*) FILTER (WHERE hd.trang_thai = 'dang_cu_tru') AS tong_ho,
      COUNT(kk.id) FILTER (WHERE kk.trang_thai IS NOT NULL AND kk.trang_thai != 'chua_ke_khai') AS da_ke_khai,
      COUNT(kk.id) FILTER (WHERE kk.trang_thai = 'da_duyet') AS da_duyet,
      COUNT(kk.id) FILTER (WHERE kk.trang_thai = 'tra_lai') AS tra_lai
    FROM ho_dan hd
    LEFT JOIN LATERAL (
      SELECT id, trang_thai FROM ke_khai_ho WHERE ho_dan_id = hd.id AND dot_id = $1 ORDER BY phien_ban DESC LIMIT 1
    ) kk ON TRUE
    WHERE hd.thon_id = $2 AND hd.trang_thai = 'dang_cu_tru'`,
    [dotId, thonId]
  )
  return result.rows[0]
}

export async function tongHopThon(dotId, thonId) {
  const result = await query(
    `SELECT
      COUNT(DISTINCT hd.id) AS ct01_tong_ho,
      COALESCE(SUM(kk.ct02_tong_nhan_khau), 0) AS ct02_tong_nhan_khau,
      COALESCE(SUM(kk.ct03_ho_ngheo), 0) AS ct03_ho_ngheo,
      COALESCE(SUM(kk.ct04_ho_can_ngheo), 0) AS ct04_ho_can_ngheo,
      COALESCE(SUM(kk.ct05_nguoi_co_cong), 0) AS ct05_nguoi_co_cong,
      COALESCE(SUM(kk.ct06_bao_tro_xh), 0) AS ct06_bao_tro_xh,
      COALESCE(SUM(kk.ct07_tre_duoi_16), 0) AS ct07_tre_duoi_16,
      COALESCE(SUM(kk.ct08_tre_hoan_canh), 0) AS ct08_tre_hoan_canh,
      COALESCE(SUM(kk.ct10_tuoi_lao_dong), 0) AS ct10_tuoi_lao_dong,
      COALESCE(SUM(kk.ct11_tham_gia_bhyt), 0) AS ct11_tham_gia_bhyt
    FROM ho_dan hd
    LEFT JOIN ke_khai_ho kk ON hd.id = kk.ho_dan_id AND kk.dot_id = $1 AND kk.trang_thai = 'da_duyet'
    WHERE hd.thon_id = $2 AND hd.trang_thai = 'dang_cu_tru'`,
    [dotId, thonId]
  )
  return result.rows[0]
}
