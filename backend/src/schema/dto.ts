// ===== UTILS =====

export function sanitizeSoNguyen(value: any): number | null {
  if (value === undefined || value === null || value === '') return null
  const str = String(value).replace(/[.,\s]/g, '')
  const num = Number(str)
  if (isNaN(num) || !Number.isInteger(num)) return null
  return num
}

export function sanitizeKeKhaiFields(body: any) {
  const fields = ['ct02_tong_nhan_khau', 'ct03_ho_ngheo', 'ct04_ho_can_ngheo', 'ct05_nguoi_co_cong', 'ct06_bao_tro_xh', 'ct07_tre_duoi_16', 'ct08_tre_hoan_canh', 'ct10_tuoi_lao_dong', 'ct11_tham_gia_bhyt']
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== null) {
      body[f] = sanitizeSoNguyen(body[f])
    }
  }
  return body
}

export function sanitizeKeKhaiThonFields(body: any) {
  const fields = ['ct09_gia_dinh_van_hoa', 'ct12_thanh_vien_to_cnsc', 'ct13_huong_dan_dvc', 'ct14_bao_luc_gia_dinh']
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== null) {
      body[f] = sanitizeSoNguyen(body[f])
    }
  }
  return body
}

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
  const ct02 = Number(body.ct02_tong_nhan_khau)
  if (body.ct05_nguoi_co_cong !== undefined && body.ct02_tong_nhan_khau !== undefined) {
    if (Number(body.ct05_nguoi_co_cong) > ct02) {
      errors.push('CT05: Nguoi co cong khong the nhieu hon tong nhan khau')
    }
  }
  if (body.ct06_bao_tro_xh !== undefined && body.ct02_tong_nhan_khau !== undefined) {
    if (Number(body.ct06_bao_tro_xh) > ct02) {
      errors.push('CT06: Doi tuong bao tro XH khong the nhieu hon tong nhan khau')
    }
  }
  if (body.ct07_tre_duoi_16 !== undefined && body.ct02_tong_nhan_khau !== undefined) {
    if (Number(body.ct07_tre_duoi_16) > ct02) {
      errors.push('CT07: Tre em duoi 16 khong the nhieu hon tong nhan khau')
    }
  }
  if (body.ct10_tuoi_lao_dong !== undefined && body.ct02_tong_nhan_khau !== undefined) {
    if (Number(body.ct10_tuoi_lao_dong) > ct02) {
      errors.push('CT10: Nguoi trong tuoi lao dong khong the nhieu hon tong nhan khau')
    }
  }
  return errors
}

export function validateKeKhaiThon(body, context?: { tongHo?: number, tongNhanKhau?: number }) {
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
  if (context) {
    if (context.tongHo !== undefined && body.ct09_gia_dinh_van_hoa !== undefined) {
      if (Number(body.ct09_gia_dinh_van_hoa) > context.tongHo) {
        errors.push('CT09: So ho gia dinh van hoa khong the nhieu hon tong so ho')
      }
    }
    if (context.tongNhanKhau !== undefined && body.ct12_thanh_vien_to_cnsc !== undefined) {
      if (Number(body.ct12_thanh_vien_to_cnsc) > context.tongNhanKhau) {
        errors.push('CT12: Thanh vien To CNSC khong the nhieu hon tong nhan khau')
      }
    }
    if (context.tongNhanKhau !== undefined && body.ct13_huong_dan_dvc !== undefined) {
      if (Number(body.ct13_huong_dan_dvc) > context.tongNhanKhau) {
        errors.push('CT13: Nguoi huong dan DVC khong the nhieu hon tong nhan khau')
      }
    }
  }
  return errors
}

export function validateTongHopThon(tongHop: {
  ct01_tong_ho: number, ct02_tong_nhan_khau: number, ct03_ho_ngheo: number,
  ct04_ho_can_ngheo: number, ct07_tre_duoi_16: number, ct08_tre_hoan_canh: number,
  ct09_gia_dinh_van_hoa: number, ct10_tuoi_lao_dong: number, ct11_tham_gia_bhyt: number,
}) {
  const errors = []
  const ct01 = Number(tongHop.ct01_tong_ho)
  const ct02 = Number(tongHop.ct02_tong_nhan_khau)
  const ct03 = Number(tongHop.ct03_ho_ngheo)
  const ct04 = Number(tongHop.ct04_ho_can_ngheo)
  const ct07 = Number(tongHop.ct07_tre_duoi_16)
  const ct08 = Number(tongHop.ct08_tre_hoan_canh)
  const ct09 = Number(tongHop.ct09_gia_dinh_van_hoa)
  const ct10 = Number(tongHop.ct10_tuoi_lao_dong)
  const ct11 = Number(tongHop.ct11_tham_gia_bhyt)

  if (ct01 > 0 && (ct02 < ct01 * 3 || ct02 > ct01 * 4.5)) {
    errors.push('CT02: Tong nhan khau khong hop ly so voi tong so ho (ky vong 3-4.5 lan)')
  }
  if (ct03 > ct01) {
    errors.push('CT03: So ho ngheo khong the nhieu hon tong so ho')
  }
  if (ct03 + ct04 > ct01) {
    errors.push('CT03+CT04: Tong ho ngheo + can ngheo vuot qua tong so ho')
  }
  if (ct07 > ct02) {
    errors.push('CT07: So tre em khong the nhieu hon tong nhan khau')
  }
  if (ct08 > ct07) {
    errors.push('CT08: Tre em hoan canh dac biet khong the nhieu hon tong tre em')
  }
  if (ct09 > ct01) {
    errors.push('CT09: So ho gia dinh van hoa khong the nhieu hon tong so ho')
  }
  if (ct10 > ct02) {
    errors.push('CT10: Nguoi trong tuoi lao dong khong the nhieu hon tong nhan khau')
  }
  if (ct11 > ct02) {
    errors.push('CT11: Nguoi tham gia BHYT khong the nhieu hon tong nhan khau')
  }
  return errors
}

export function validateDotKeKhai(body) {
  const errors = []
  if (!body.ten_dot) errors.push('Thieu ten dot ke khai')
  if (!body.loai || !['dinh_ky', 'dot_xuat'].includes(body.loai)) errors.push('Loai phai la dinh_ky hoac dot_xuat')
  if (!body.nam) errors.push('Thieu nam')
  if (!body.ngay_bat_dau) errors.push('Thieu ngay bat dau')
  else {
    const homNay = new Date().toISOString().split('T')[0]
    if (body.ngay_bat_dau < homNay) errors.push('Ngay bat dau khong duoc truoc ngay hom nay')
  }
  if (!body.ngay_ket_thuc) errors.push('Thieu ngay ket thuc')
  if (body.ngay_bat_dau && body.ngay_ket_thuc && body.ngay_bat_dau > body.ngay_ket_thuc) {
    errors.push('Ngay ket thuc phai sau ngay bat dau')
  }
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

// ===== QUAN LY NHAN KHAU =====

// Che thong tin nhay cam (dung khi can hien 1 phan o cho khong phai Detail View)
export function maskCccd(cccd) {
  if (!cccd) return null
  return cccd.length > 4 ? '*'.repeat(cccd.length - 4) + cccd.slice(-4) : cccd
}

export function maskSdt(sdt) {
  if (!sdt) return null
  return sdt.length > 3 ? '*'.repeat(sdt.length - 3) + sdt.slice(-3) : sdt
}

// List View: KHONG lo CCCD/SDT/dia chi thuc (chi ho ten + trang thai de nhan dien)
export function toHoDanListResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    ho_ten_chu_ho: row.ho_ten_chu_ho,
    chu_ho_id: row.chu_ho_id,
    thon_id: row.thon_id,
    ten_thon: row.ten_thon,
    trang_thai: row.trang_thai,
    ngay_roi: row.ngay_roi,
    // Ket qua tra ve co CCCD/SDT bi che 1 phan (khong lo hoan toan o List)
    cccd_che: maskCccd(row.cccd),
    sdt_che: maskSdt(row.so_dien_thoai),
    updated_at: row.updated_at,
  }
}

// Detail View: lo day du (chi tra ve sau khi da ghi log truy cap)
export function toHoDanDetailResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    chu_ho_id: row.chu_ho_id,
    ho_ten_chu_ho: row.ho_ten_chu_ho,
    cccd: row.cccd,
    so_dien_thoai: row.so_dien_thoai,
    dia_chi: row.dia_chi,
    thon_id: row.thon_id,
    ten_thon: row.ten_thon,
    trang_thai: row.trang_thai,
    trang_thai_tai_khoan: row.trang_thai_tai_khoan,
    ngay_roi: row.ngay_roi,
    ly_do_roi: row.ly_do_roi,
    ghi_chu: row.ghi_chu,
    nguoi_cap_nhat: row.nguoi_cap_nhat,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function validateTaoHoChuyenDen(body) {
  const errors = []
  if (!body.ho_ten || body.ho_ten.trim().length < 2) errors.push('Ho ten khong hop le')
  if (!body.cccd || !/^\d{12}$/.test(body.cccd)) errors.push('CCCD phai gom dung 12 chu so')
  if (!body.so_dien_thoai || !/^0\d{9}$/.test(body.so_dien_thoai)) errors.push('So dien thoai phai gom 10 chu so, bat dau bang 0')
  if (!body.thon_id) errors.push('Thieu thon (thon_id)')
  return errors
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
    chi_tieu_tra_lai: row.chi_tieu_tra_lai,
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
    chi_tieu: row.chi_tieu,
  }
}
