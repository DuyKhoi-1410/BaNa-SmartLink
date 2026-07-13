import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import * as keKhaiThonRepo from '../repositories/keKhaiThonRepo.js'
import * as hoDanRepo from '../repositories/hoDanRepo.js'
import * as thonRepo from '../repositories/thonRepo.js'

export async function keKhaiHo(data) {
  const existing = await keKhaiHoRepo.timTheoHoDanVaDot(data.ho_dan_id, data.dot_id)
  const phienBan = existing ? existing.phien_ban + 1 : 1
  return keKhaiHoRepo.taoMoi({ ...data, phien_ban: phienBan })
}

export async function layKeKhaiTheoDot(dotId, thonId) {
  return keKhaiHoRepo.layTheoDot(dotId, thonId)
}

export async function duyetKeKhai(id, nguoiDuyetId) {
  return keKhaiHoRepo.duyetKeKhai(id, nguoiDuyetId)
}

export async function traLaiKeKhai(id, nguoiDuyetId, lyDo, chiTieuTraLai?) {
  return keKhaiHoRepo.traLaiKeKhai(id, nguoiDuyetId, lyDo, chiTieuTraLai)
}

export async function keKhaiThon(data) {
  return keKhaiThonRepo.taoHoacCapNhat(data)
}

export async function nopThonLenXa(dotId, thonId) {
  return keKhaiThonRepo.nopLenXa(dotId, thonId)
}

export async function tienDoThon(dotId, thonId) {
  return keKhaiHoRepo.tienDoThon(dotId, thonId)
}

export async function tongHopThon(dotId, thonId) {
  const hoData = await keKhaiHoRepo.tongHopThon(dotId, thonId)
  const thonData = await keKhaiThonRepo.timTheoDotVaThon(dotId, thonId)
  return {
    ...hoData,
    ct09_gia_dinh_van_hoa: thonData?.ct09_gia_dinh_van_hoa || 0,
    ct12_thanh_vien_to_cnsc: thonData?.ct12_thanh_vien_to_cnsc || 0,
    ct13_huong_dan_dvc: thonData?.ct13_huong_dan_dvc || 0,
    ct14_bao_luc_gia_dinh: thonData?.ct14_bao_luc_gia_dinh || 0,
  }
}

export async function tongHopXa(dotId) {
  const thons = await thonRepo.layTatCa()
  const ketQua = []
  for (const thon of thons) {
    const data = await tongHopThon(dotId, thon.id)
    const tienDo = await tienDoThon(dotId, thon.id)
    ketQua.push({ thon_id: thon.id, ten_thon: thon.ten_thon, ...data, tien_do: tienDo })
  }
  return ketQua
}
