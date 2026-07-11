// ===== REQUEST DTOs =====

export function validateLoginDan(body) {
  const errors = []
  if (!body.cccd || !/^\d{12}$/.test(body.cccd)) errors.push('CCCD phai gom dung 12 chu so')
  if (!body.ho_ten || body.ho_ten.trim().length < 2) errors.push('Ho ten khong hop le')
  return errors
}

export function validateLoginCanBo(body) {
  const errors = []
  if (!body.ten_dang_nhap) errors.push('Thieu ten dang nhap')
  if (!body.mat_khau) errors.push('Thieu mat khau')
  return errors
}

export function validateKeKhaiHo(body) {
  const errors = []
  const fields = ['ct02_tong_nhan_khau', 'ct03_ho_ngheo', 'ct04_ho_can_ngheo', 'ct05_nguoi_co_cong', 'ct06_bao_tro_xh', 'ct07_tre_duoi_16', 'ct08_tre_hoan_canh', 'ct10_tuoi_lao_dong', 'ct11_tham_gia_bhyt']

  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== null) {
      const val = Number(body[f])
      if (!Number.isInteger(val) || val < 0) {
        errors.push(`${f}: Gia tri phai la so nguyen >= 0`)
      }
    }
  }

  if (body.ct02_tong_nhan_khau !== undefined && Number(body.ct02_tong_nhan_khau) < 1) {
    errors.push('CT02: Moi ho phai co it nhat 1 nhan khau')
  }
  if (body.ct03_ho_ngheo !== undefined && Number(body.ct03_ho_ngheo) > 1) {
    errors.push('CT03: Gia tri ho ngheo chi co the la 0 hoac 1')
  }
  if (body.ct04_ho_can_ngheo !== undefined && Number(body.ct04_ho_can_ngheo) > 1) {
    errors.push('CT04: Gia tri ho can ngheo chi co the la 0 hoac 1')
  }
  if (body.ct03_ho_ngheo !== undefined && body.ct04_ho_can_ngheo !== undefined) {
    if (Number(body.ct03_ho_ngheo) + Number(body.ct04_ho_can_ngheo) > 1) {
      errors.push('Ho khong the vua ngheo vua can ngheo')
    }
  }
  if (body.ct08_tre_hoan_canh !== undefined && body.ct07_tre_duoi_16 !== undefined) {
    if (Number(body.ct08_tre_hoan_canh) > Number(body.ct07_tre_duoi_16)) {
      errors.push('CT08: Tre em hoan canh khong the nhieu hon tong tre em')
    }
  }
  if (body.ct11_tham_gia_bhyt !== undefined && body.ct02_tong_nhan_khau !== undefined) {
    if (Number(body.ct11_tham_gia_bhyt) > Number(body.ct02_tong_nhan_khau)) {
      errors.push('CT11: So nguoi tham gia BHYT khong the nhieu hon tong nhan khau')
    }
  }
  return errors
}

export function validateKeKhaiThon(body) {
  const errors = []
  const fields = ['ct09_gia_dinh_van_hoa', 'ct12_thanh_vien_to_cnsc', 'ct13_huong_dan_dvc', 'ct14_bao_luc_gia_dinh']
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== null) {
      const val = Number(body[f])
      if (!Number.isInteger(val) || val < 0) {
        errors.push(`${f}: Gia tri phai la so nguyen >= 0`)
      }
    }
  }
  return errors
}

export function validateDotKeKhai(body) {
  const errors = []
  if (!body.ten_dot) errors.push('Thieu ten dot ke khai')
  if (!body.loai || !['dinh_ky', 'dot_xuat'].includes(body.loai)) errors.push('Loai phai la dinh_ky hoac dot_xuat')
  if (!body.nam) errors.push('Thieu nam')
  if (!body.ngay_bat_dau) errors.push('Thieu ngay bat dau')
  if (!body.ngay_ket_thuc) errors.push('Thieu ngay ket thuc')
  return errors
}

export function validateTaoHoDan(body) {
  const errors = []
  if (!body.ho_ten || body.ho_ten.trim().length < 2) errors.push('Ho ten khong hop le')
  if (!body.cccd || !/^\d{12}$/.test(body.cccd)) errors.push('CCCD phai gom dung 12 chu so')
  if (!body.so_dien_thoai || !/^0\d{9}$/.test(body.so_dien_thoai)) errors.push('So dien thoai phai gom 10 chu so, bat dau bang 0')
  if (!body.thon_id) errors.push('Thieu thon_id')
  return errors
}

// ===== RESPONSE DTOs =====

export function toUserDetailResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    ho_ten: row.ho_ten,
    cccd: row.cccd,
    so_dien_thoai: row.so_dien_thoai,
    vai_tro: row.vai_tro,
    thon_id: row.thon_id,
    ten_thon: row.ten_thon,
    trang_thai: row.trang_thai,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function toUserResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    ho_ten: row.ho_ten,
    so_dien_thoai: row.so_dien_thoai,
    vai_tro: row.vai_tro,
    thon_id: row.thon_id,
    ten_thon: row.ten_thon,
    trang_thai: row.trang_thai,
  }
}

export function toHouseholdResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    chu_ho_id: row.chu_ho_id,
    ho_ten_chu_ho: row.ho_ten_chu_ho,
    thon_id: row.thon_id,
    ten_thon: row.ten_thon,
    dia_chi: row.dia_chi,
    trang_thai: row.trang_thai,
  }
}

export function toDeclarationResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    dot_id: row.dot_id,
    ho_dan_id: row.ho_dan_id,
    phien_ban: row.phien_ban,
    ct02_tong_nhan_khau: row.ct02_tong_nhan_khau,
    ct03_ho_ngheo: row.ct03_ho_ngheo,
    ct04_ho_can_ngheo: row.ct04_ho_can_ngheo,
    ct05_nguoi_co_cong: row.ct05_nguoi_co_cong,
    ct06_bao_tro_xh: row.ct06_bao_tro_xh,
    ct07_tre_duoi_16: row.ct07_tre_duoi_16,
    ct08_tre_hoan_canh: row.ct08_tre_hoan_canh,
    ct10_tuoi_lao_dong: row.ct10_tuoi_lao_dong,
    ct11_tham_gia_bhyt: row.ct11_tham_gia_bhyt,
    trang_thai: row.trang_thai,
    ly_do_tra_lai: row.ly_do_tra_lai,
    ngay_ke_khai: row.ngay_ke_khai,
    ngay_duyet: row.ngay_duyet,
    ho_ten_chu_ho: row.ho_ten_chu_ho,
    ten_thon: row.ten_thon,
  }
}

export function toPeriodResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    ten_dot: row.ten_dot,
    mo_ta: row.mo_ta,
    loai: row.loai,
    quy: row.quy,
    nam: row.nam,
    ngay_bat_dau: row.ngay_bat_dau,
    ngay_ket_thuc: row.ngay_ket_thuc,
    trang_thai: row.trang_thai,
  }
}
