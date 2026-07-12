import { query } from './db.js'

// Ghi nhat ky thao tac ghi/sua (audit trail)
export async function ghiNhatKy(data: {
  nguoi_dung_id: number
  hanh_dong: string
  bang_lien_quan?: string
  ban_ghi_id?: number
  du_lieu_cu?: unknown
  du_lieu_moi?: unknown
  ip_address?: string | null
  user_agent?: string | null
}) {
  await query(
    `INSERT INTO nhat_ky (nguoi_dung_id, hanh_dong, bang_lien_quan, ban_ghi_id, du_lieu_cu, du_lieu_moi, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      data.nguoi_dung_id,
      data.hanh_dong,
      data.bang_lien_quan || null,
      data.ban_ghi_id || null,
      data.du_lieu_cu ? JSON.stringify(data.du_lieu_cu) : null,
      data.du_lieu_moi ? JSON.stringify(data.du_lieu_moi) : null,
      data.ip_address || null,
      data.user_agent || null,
    ]
  )
}

// Ghi log truy cap ho so nhay cam (ai xem CCCD/SDT/dia chi, khi nao, tu IP nao)
export async function ghiTruyCap(data: {
  nguoi_dung_id: number
  bang_lien_quan: string
  ban_ghi_id: number
  loai_truy_cap?: 'xem' | 'xuat' | 'tai'
  truong_nhay_cam?: string
  ip_address?: string | null
  user_agent?: string | null
}) {
  await query(
    `INSERT INTO nhat_ky_truy_cap (nguoi_dung_id, loai_truy_cap, bang_lien_quan, ban_ghi_id, truong_nhay_cam, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      data.nguoi_dung_id,
      data.loai_truy_cap || 'xem',
      data.bang_lien_quan,
      data.ban_ghi_id,
      data.truong_nhay_cam || null,
      data.ip_address || null,
      data.user_agent || null,
    ]
  )
}

// Lay lich su truy cap 1 ho so (cho xa kiem tra)
export async function layTruyCapTheoBanGhi(bangLienQuan: string, banGhiId: number, limit = 50) {
  const result = await query(
    `SELECT tc.*, nd.ho_ten AS ten_nguoi_truy_cap, nd.vai_tro
     FROM nhat_ky_truy_cap tc
     LEFT JOIN nguoi_dung nd ON tc.nguoi_dung_id = nd.id
     WHERE tc.bang_lien_quan = $1 AND tc.ban_ghi_id = $2
     ORDER BY tc.created_at DESC LIMIT $3`,
    [bangLienQuan, banGhiId, limit]
  )
  return result.rows
}
