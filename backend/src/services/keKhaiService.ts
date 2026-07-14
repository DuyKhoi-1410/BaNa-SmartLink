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
  const [hoData, thonData, tienDoData] = await Promise.all([
    keKhaiHoRepo.tongHopTatCaThon(dotId),
    keKhaiThonRepo.layTheoDot(dotId),
    keKhaiHoRepo.tienDoTatCaThon(dotId),
  ])
  const thonMap = {}
  thonData.forEach(t => { thonMap[t.thon_id] = t })
  const tienDoMap = {}
  tienDoData.forEach(t => { tienDoMap[t.thon_id] = t })
  return hoData.map(row => {
    const kt = thonMap[row.thon_id] || {}
    const td = tienDoMap[row.thon_id] || {}
    return {
      thon_id: row.thon_id,
      ten_thon: row.ten_thon,
      ...row,
      ct09_gia_dinh_van_hoa: kt.ct09_gia_dinh_van_hoa || 0,
      ct12_thanh_vien_to_cnsc: kt.ct12_thanh_vien_to_cnsc || 0,
      ct13_huong_dan_dvc: kt.ct13_huong_dan_dvc || 0,
      ct14_bao_luc_gia_dinh: kt.ct14_bao_luc_gia_dinh || 0,
      tien_do: { tong_ho: td.tong_ho || 0, da_ke_khai: td.da_ke_khai || 0, da_duyet: td.da_duyet || 0, tra_lai: td.tra_lai || 0 },
    }
  })
}
