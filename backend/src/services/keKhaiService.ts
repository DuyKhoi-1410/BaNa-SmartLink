import * as keKhaiHoRepo from '../repositories/keKhaiHoRepo.js'
import * as keKhaiThonRepo from '../repositories/keKhaiThonRepo.js'
import * as hoDanRepo from '../repositories/hoDanRepo.js'
import * as thonRepo from '../repositories/thonRepo.js'
import * as dotKeKhaiRepo from '../repositories/dotKeKhaiRepo.js'

export async function keKhaiHo(data) {
  const existing = await keKhaiHoRepo.timTheoHoDanVaDot(data.ho_dan_id, data.dot_id)
  const phienBan = existing ? existing.phien_ban + 1 : 1

  const dsSua = data.danh_sach_thay_doi
  const giuNguyenHet = existing && Array.isArray(dsSua) && dsSua.length === 0

  const trangThai = giuNguyenHet ? 'da_duyet' : (data.trang_thai || 'da_ke_khai')

  const kk = await keKhaiHoRepo.taoMoi({
    ...data,
    phien_ban: phienBan,
    trang_thai: trangThai,
    danh_sach_thay_doi: Array.isArray(dsSua) ? dsSua : null,
  })

  if (giuNguyenHet) {
    await keKhaiHoRepo.duyetKeKhai(kk.id, data.nguoi_ke_khai_id)
  }

  return giuNguyenHet
    ? await keKhaiHoRepo.timTheoId(kk.id)
    : kk
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

const TAT_CA_CT = ['CT01','CT02','CT03','CT04','CT05','CT06','CT07','CT08','CT09','CT10','CT11','CT12','CT13','CT14']
const CT_FIELD_MAP = {
  CT01: 'ct01_tong_ho', CT02: 'ct02_tong_nhan_khau', CT03: 'ct03_ho_ngheo',
  CT04: 'ct04_ho_can_ngheo', CT05: 'ct05_nguoi_co_cong', CT06: 'ct06_bao_tro_xh',
  CT07: 'ct07_tre_duoi_16', CT08: 'ct08_tre_hoan_canh', CT09: 'ct09_gia_dinh_van_hoa',
  CT10: 'ct10_tuoi_lao_dong', CT11: 'ct11_tham_gia_bhyt',
  CT12: 'ct12_thanh_vien_to_cnsc', CT13: 'ct13_huong_dan_dvc', CT14: 'ct14_bao_luc_gia_dinh',
}

export async function tongHopMoiNhat() {
  const CT_THON = new Set(['CT09', 'CT12', 'CT13', 'CT14'])
  const ketQua: Record<number, Record<string, any>> = {}
  const daLapThon: Record<number, Set<string>> = {}

  const tongHoRealtime = await hoDanRepo.demTheoTatCaThon()
  for (const row of tongHoRealtime) {
    ketQua[row.thon_id] = { thon_id: row.thon_id, ten_thon: row.ten_thon, ct01_tong_ho: parseInt(row.tong_ho) || 0 }
    daLapThon[row.thon_id] = new Set(['CT01'])
  }

  const danhSachDot = await dotKeKhaiRepo.layTatCa()
  for (const dot of danhSachDot) {
    const chiTieuDot: string[] = Array.isArray(dot.chi_tieu) ? dot.chi_tieu : TAT_CA_CT
    const duLieuDot = await tongHopXa(dot.id)
    const thonRecords = await keKhaiThonRepo.layTheoDot(dot.id)
    const daNopXa = new Set(thonRecords.filter(t => t.trang_thai === 'da_nop_xa').map(t => t.thon_id))

    for (const thon of duLieuDot) {
      if (!ketQua[thon.thon_id]) {
        ketQua[thon.thon_id] = { thon_id: thon.thon_id, ten_thon: thon.ten_thon }
        daLapThon[thon.thon_id] = new Set()
      }

      const thonDaNopXa = daNopXa.has(thon.thon_id)
      const coDuLieuHo = thonDaNopXa && (thon.tien_do?.da_duyet || 0) > 0
      const coDuLieuThon = thonDaNopXa

      for (const ct of chiTieuDot) {
        if (daLapThon[thon.thon_id].has(ct)) continue
        const field = CT_FIELD_MAP[ct]
        if (!field) continue

        const laCTThon = CT_THON.has(ct)
        if (laCTThon && !coDuLieuThon) continue
        if (!laCTThon && !coDuLieuHo) continue

        ketQua[thon.thon_id][field] = parseInt(thon[field]) || 0
        daLapThon[thon.thon_id].add(ct)
      }
    }
  }

  return Object.values(ketQua).map(thon => {
    for (const ct of TAT_CA_CT) {
      const field = CT_FIELD_MAP[ct]
      if (!(field in thon)) thon[field] = 0
    }
    return thon
  }).sort((a: any, b: any) => (a.ten_thon || '').localeCompare(b.ten_thon || ''))
}
