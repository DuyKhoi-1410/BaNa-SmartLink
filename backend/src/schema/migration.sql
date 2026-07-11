-- Ba Na SmartLink - Database Schema
-- Luong: Dan -> Thon -> Xa

-- Bang thon (22 thon cua xa Ba Na)
CREATE TABLE IF NOT EXISTS thon (
  id SERIAL PRIMARY KEY,
  ten_thon VARCHAR(100) NOT NULL,
  ma_thon VARCHAR(20) UNIQUE NOT NULL,
  trang_thai VARCHAR(20) DEFAULT 'hoat_dong',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang nguoi dung (dan, can bo thon, can bo xa)
CREATE TABLE IF NOT EXISTS nguoi_dung (
  id SERIAL PRIMARY KEY,
  ho_ten VARCHAR(200) NOT NULL,
  cccd VARCHAR(12) UNIQUE,
  so_dien_thoai VARCHAR(15),
  vai_tro VARCHAR(20) NOT NULL CHECK (vai_tro IN ('dan', 'thon', 'xa')),
  thon_id INTEGER REFERENCES thon(id),
  ten_dang_nhap VARCHAR(100) UNIQUE,
  mat_khau_hash VARCHAR(255),
  trang_thai VARCHAR(20) DEFAULT 'hoat_dong',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang ho dan (moi ho co 1 chu ho)
CREATE TABLE IF NOT EXISTS ho_dan (
  id SERIAL PRIMARY KEY,
  chu_ho_id INTEGER NOT NULL REFERENCES nguoi_dung(id),
  thon_id INTEGER NOT NULL REFERENCES thon(id),
  dia_chi VARCHAR(500),
  trang_thai VARCHAR(20) DEFAULT 'dang_cu_tru' CHECK (trang_thai IN ('dang_cu_tru', 'da_roi')),
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang dot ke khai (xa tao)
CREATE TABLE IF NOT EXISTS dot_ke_khai (
  id SERIAL PRIMARY KEY,
  ten_dot VARCHAR(200) NOT NULL,
  mo_ta TEXT,
  loai VARCHAR(20) NOT NULL CHECK (loai IN ('dinh_ky', 'dot_xuat')),
  quy INTEGER CHECK (quy BETWEEN 1 AND 4),
  nam INTEGER NOT NULL,
  ngay_bat_dau DATE NOT NULL,
  ngay_ket_thuc DATE NOT NULL,
  trang_thai VARCHAR(20) DEFAULT 'dang_mo' CHECK (trang_thai IN ('dang_mo', 'da_dong', 'huy')),
  nguoi_tao_id INTEGER REFERENCES nguoi_dung(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang ke khai ho dan (dan nhap CT02-CT08, CT10, CT11)
CREATE TABLE IF NOT EXISTS ke_khai_ho (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER NOT NULL REFERENCES dot_ke_khai(id),
  ho_dan_id INTEGER NOT NULL REFERENCES ho_dan(id),
  phien_ban INTEGER DEFAULT 1,
  ct02_tong_nhan_khau INTEGER DEFAULT 0,
  ct03_ho_ngheo INTEGER DEFAULT 0,
  ct04_ho_can_ngheo INTEGER DEFAULT 0,
  ct05_nguoi_co_cong INTEGER DEFAULT 0,
  ct06_bao_tro_xh INTEGER DEFAULT 0,
  ct07_tre_duoi_16 INTEGER DEFAULT 0,
  ct08_tre_hoan_canh INTEGER DEFAULT 0,
  ct10_tuoi_lao_dong INTEGER DEFAULT 0,
  ct11_tham_gia_bhyt INTEGER DEFAULT 0,
  trang_thai VARCHAR(30) DEFAULT 'chua_ke_khai' CHECK (trang_thai IN ('chua_ke_khai', 'da_ke_khai', 'da_duyet', 'tra_lai', 'giu_nguyen')),
  ly_do_tra_lai TEXT,
  ghi_chu TEXT,
  nguoi_ke_khai_id INTEGER REFERENCES nguoi_dung(id),
  ngay_ke_khai TIMESTAMPTZ,
  nguoi_duyet_id INTEGER REFERENCES nguoi_dung(id),
  ngay_duyet TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang ke khai thon (thon nhap CT09, CT12, CT13, CT14)
CREATE TABLE IF NOT EXISTS ke_khai_thon (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER NOT NULL REFERENCES dot_ke_khai(id),
  thon_id INTEGER NOT NULL REFERENCES thon(id),
  ct09_gia_dinh_van_hoa INTEGER DEFAULT 0,
  ct12_thanh_vien_to_cnsc INTEGER DEFAULT 0,
  ct13_huong_dan_dvc INTEGER DEFAULT 0,
  ct14_bao_luc_gia_dinh INTEGER DEFAULT 0,
  trang_thai VARCHAR(20) DEFAULT 'chua_nhap' CHECK (trang_thai IN ('chua_nhap', 'da_nhap', 'da_nop_xa')),
  nguoi_nhap_id INTEGER REFERENCES nguoi_dung(id),
  ngay_nhap TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang minh chung (anh chup giay to)
CREATE TABLE IF NOT EXISTS minh_chung (
  id SERIAL PRIMARY KEY,
  ke_khai_ho_id INTEGER REFERENCES ke_khai_ho(id),
  ke_khai_thon_id INTEGER REFERENCES ke_khai_thon(id),
  ma_chi_tieu VARCHAR(10) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  loai_file VARCHAR(50),
  nguoi_upload_id INTEGER REFERENCES nguoi_dung(id),
  da_xoa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang dinh kem dot (xa upload file cho thon xem/tai)
CREATE TABLE IF NOT EXISTS dinh_kem_dot (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER NOT NULL REFERENCES dot_ke_khai(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  loai_file VARCHAR(50),
  mo_ta TEXT,
  nguoi_upload_id INTEGER REFERENCES nguoi_dung(id),
  da_xoa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang thong bao
CREATE TABLE IF NOT EXISTS thong_bao (
  id SERIAL PRIMARY KEY,
  tieu_de VARCHAR(300) NOT NULL,
  noi_dung TEXT NOT NULL,
  loai VARCHAR(30) DEFAULT 'he_thong',
  nguoi_gui_id INTEGER REFERENCES nguoi_dung(id),
  nguoi_nhan_id INTEGER REFERENCES nguoi_dung(id),
  thon_id INTEGER REFERENCES thon(id),
  dot_id INTEGER REFERENCES dot_ke_khai(id),
  da_doc BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bang nhat ky (audit log)
CREATE TABLE IF NOT EXISTS nhat_ky (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER REFERENCES nguoi_dung(id),
  hanh_dong VARCHAR(100) NOT NULL,
  bang_lien_quan VARCHAR(100),
  ban_ghi_id INTEGER,
  du_lieu_cu JSONB,
  du_lieu_moi JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_ke_khai_ho_unique ON ke_khai_ho(dot_id, ho_dan_id, phien_ban);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ke_khai_thon_unique ON ke_khai_thon(dot_id, thon_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_nguoi_dung_vai_tro ON nguoi_dung(vai_tro);
CREATE INDEX IF NOT EXISTS idx_nguoi_dung_thon ON nguoi_dung(thon_id);
CREATE INDEX IF NOT EXISTS idx_ho_dan_thon ON ho_dan(thon_id);
CREATE INDEX IF NOT EXISTS idx_ho_dan_trang_thai ON ho_dan(trang_thai);
CREATE INDEX IF NOT EXISTS idx_ke_khai_ho_dot ON ke_khai_ho(dot_id);
CREATE INDEX IF NOT EXISTS idx_ke_khai_ho_ho_dan ON ke_khai_ho(ho_dan_id);
CREATE INDEX IF NOT EXISTS idx_ke_khai_thon_dot ON ke_khai_thon(dot_id);
CREATE INDEX IF NOT EXISTS idx_thong_bao_nguoi_nhan ON thong_bao(nguoi_nhan_id);
CREATE INDEX IF NOT EXISTS idx_thong_bao_da_doc ON thong_bao(da_doc);
CREATE INDEX IF NOT EXISTS idx_minh_chung_ke_khai_ho ON minh_chung(ke_khai_ho_id);
CREATE INDEX IF NOT EXISTS idx_minh_chung_ke_khai_thon ON minh_chung(ke_khai_thon_id);
CREATE INDEX IF NOT EXISTS idx_minh_chung_chi_tieu ON minh_chung(ma_chi_tieu);
CREATE INDEX IF NOT EXISTS idx_nhat_ky_nguoi_dung ON nhat_ky(nguoi_dung_id);
CREATE INDEX IF NOT EXISTS idx_nhat_ky_bang ON nhat_ky(bang_lien_quan, ban_ghi_id);
CREATE INDEX IF NOT EXISTS idx_dinh_kem_dot_dot ON dinh_kem_dot(dot_id);
CREATE INDEX IF NOT EXISTS idx_minh_chung_da_xoa ON minh_chung(da_xoa);
CREATE INDEX IF NOT EXISTS idx_dinh_kem_dot_da_xoa ON dinh_kem_dot(da_xoa);
