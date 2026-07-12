-- Ba Na SmartLink - Database Schema (nguon chan ly)
-- Luong: Dan -> Thon -> Xa
-- Chay: npm run migrate (DROP + tao lai toan bo)

-- ================= DROP ALL =================
DROP TABLE IF EXISTS nhat_ky_truy_cap CASCADE;
DROP TABLE IF EXISTS nhat_ky CASCADE;
DROP TABLE IF EXISTS refresh_token CASCADE;
DROP TABLE IF EXISTS thong_bao CASCADE;
DROP TABLE IF EXISTS dinh_kem_dot CASCADE;
DROP TABLE IF EXISTS minh_chung CASCADE;
DROP TABLE IF EXISTS ke_khai_thon CASCADE;
DROP TABLE IF EXISTS ke_khai_ho CASCADE;
DROP TABLE IF EXISTS dot_ke_khai CASCADE;
DROP TABLE IF EXISTS ho_dan CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;
DROP TABLE IF EXISTS thon CASCADE;
DROP FUNCTION IF EXISTS set_updated_at CASCADE;

-- ================= TRIGGER FUNCTION (tu dong cap nhat updated_at) =================
CREATE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================= THON =================
CREATE TABLE thon (
  id SERIAL PRIMARY KEY,
  ten_thon VARCHAR(100) NOT NULL,
  ma_thon VARCHAR(20) UNIQUE NOT NULL,
  trang_thai VARCHAR(20) DEFAULT 'hoat_dong',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= NGUOI DUNG (them cot chong brute-force + audit dang nhap) =================
CREATE TABLE nguoi_dung (
  id SERIAL PRIMARY KEY,
  ho_ten VARCHAR(200) NOT NULL,
  cccd VARCHAR(12) UNIQUE,
  so_dien_thoai VARCHAR(15),
  vai_tro VARCHAR(20) NOT NULL CHECK (vai_tro IN ('dan','thon','xa')),
  thon_id INTEGER REFERENCES thon(id),
  ten_dang_nhap VARCHAR(100) UNIQUE,
  mat_khau_hash VARCHAR(255),
  trang_thai VARCHAR(20) DEFAULT 'hoat_dong' CHECK (trang_thai IN ('hoat_dong','ngung_hoat_dong')),
  so_lan_dang_nhap_sai INTEGER DEFAULT 0,
  khoa_den TIMESTAMPTZ,
  lan_dang_nhap_cuoi TIMESTAMPTZ,
  doi_mat_khau_luc TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= HO DAN (them audit roi di + nguoi cap nhat) =================
CREATE TABLE ho_dan (
  id SERIAL PRIMARY KEY,
  chu_ho_id INTEGER NOT NULL REFERENCES nguoi_dung(id),
  thon_id INTEGER NOT NULL REFERENCES thon(id),
  dia_chi VARCHAR(500),
  trang_thai VARCHAR(20) DEFAULT 'dang_cu_tru' CHECK (trang_thai IN ('dang_cu_tru','da_roi')),
  ghi_chu TEXT,
  ngay_roi DATE,
  ly_do_roi TEXT,
  nguoi_cap_nhat_id INTEGER REFERENCES nguoi_dung(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= DOT KE KHAI =================
CREATE TABLE dot_ke_khai (
  id SERIAL PRIMARY KEY,
  ten_dot VARCHAR(200) NOT NULL,
  mo_ta TEXT,
  loai VARCHAR(20) NOT NULL CHECK (loai IN ('dinh_ky','dot_xuat')),
  quy INTEGER CHECK (quy BETWEEN 1 AND 4),
  nam INTEGER NOT NULL,
  ngay_bat_dau DATE NOT NULL,
  ngay_ket_thuc DATE NOT NULL,
  trang_thai VARCHAR(20) DEFAULT 'dang_mo' CHECK (trang_thai IN ('dang_mo','da_dong','huy')),
  nguoi_tao_id INTEGER REFERENCES nguoi_dung(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= KE KHAI HO (dan nhap CT02-CT08, CT10, CT11) =================
CREATE TABLE ke_khai_ho (
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
  trang_thai VARCHAR(30) DEFAULT 'chua_ke_khai' CHECK (trang_thai IN ('chua_ke_khai','da_ke_khai','da_duyet','tra_lai','giu_nguyen')),
  ly_do_tra_lai TEXT,
  ghi_chu TEXT,
  nguoi_ke_khai_id INTEGER REFERENCES nguoi_dung(id),
  ngay_ke_khai TIMESTAMPTZ,
  nguoi_duyet_id INTEGER REFERENCES nguoi_dung(id),
  ngay_duyet TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= KE KHAI THON (thon nhap CT09, CT12, CT13, CT14) =================
CREATE TABLE ke_khai_thon (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER NOT NULL REFERENCES dot_ke_khai(id),
  thon_id INTEGER NOT NULL REFERENCES thon(id),
  ct09_gia_dinh_van_hoa INTEGER DEFAULT 0,
  ct12_thanh_vien_to_cnsc INTEGER DEFAULT 0,
  ct13_huong_dan_dvc INTEGER DEFAULT 0,
  ct14_bao_luc_gia_dinh INTEGER DEFAULT 0,
  trang_thai VARCHAR(20) DEFAULT 'chua_nhap' CHECK (trang_thai IN ('chua_nhap','da_nhap','da_nop_xa')),
  nguoi_nhap_id INTEGER REFERENCES nguoi_dung(id),
  ngay_nhap TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= MINH CHUNG (anh chup giay to, soft-delete co truy vet) =================
CREATE TABLE minh_chung (
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
  nguoi_xoa_id INTEGER REFERENCES nguoi_dung(id),
  ngay_xoa TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= DINH KEM DOT (xa upload file cho thon) =================
CREATE TABLE dinh_kem_dot (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER NOT NULL REFERENCES dot_ke_khai(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  loai_file VARCHAR(50),
  mo_ta TEXT,
  nguoi_upload_id INTEGER REFERENCES nguoi_dung(id),
  da_xoa BOOLEAN DEFAULT FALSE,
  nguoi_xoa_id INTEGER REFERENCES nguoi_dung(id),
  ngay_xoa TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= THONG BAO =================
CREATE TABLE thong_bao (
  id SERIAL PRIMARY KEY,
  tieu_de VARCHAR(300) NOT NULL,
  noi_dung TEXT NOT NULL,
  loai VARCHAR(30) DEFAULT 'he_thong',
  nguoi_gui_id INTEGER REFERENCES nguoi_dung(id),
  nguoi_nhan_id INTEGER REFERENCES nguoi_dung(id),
  thon_id INTEGER REFERENCES thon(id),
  dot_id INTEGER REFERENCES dot_ke_khai(id),
  da_doc BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= REFRESH TOKEN (JWT refresh 7d, co the thu hoi) =================
CREATE TABLE refresh_token (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  het_han TIMESTAMPTZ NOT NULL,
  da_thu_hoi BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= NHAT KY (audit ghi/sua) =================
CREATE TABLE nhat_ky (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER REFERENCES nguoi_dung(id),
  hanh_dong VARCHAR(100) NOT NULL,
  bang_lien_quan VARCHAR(100),
  ban_ghi_id INTEGER,
  du_lieu_cu JSONB,
  du_lieu_moi JSONB,
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= NHAT KY TRUY CAP (log XEM ho so nhay cam: CCCD/SDT/dia chi) =================
CREATE TABLE nhat_ky_truy_cap (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER REFERENCES nguoi_dung(id),
  loai_truy_cap VARCHAR(20) NOT NULL DEFAULT 'xem' CHECK (loai_truy_cap IN ('xem','xuat','tai')),
  bang_lien_quan VARCHAR(100) NOT NULL,
  ban_ghi_id INTEGER NOT NULL,
  truong_nhay_cam VARCHAR(255),
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= TRIGGERS updated_at =================
CREATE TRIGGER trg_thon_updated BEFORE UPDATE ON thon FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nguoi_dung_updated BEFORE UPDATE ON nguoi_dung FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ho_dan_updated BEFORE UPDATE ON ho_dan FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_dot_updated BEFORE UPDATE ON dot_ke_khai FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_kkho_updated BEFORE UPDATE ON ke_khai_ho FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_kkthon_updated BEFORE UPDATE ON ke_khai_thon FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_minhchung_updated BEFORE UPDATE ON minh_chung FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_dinhkem_updated BEFORE UPDATE ON dinh_kem_dot FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_thongbao_updated BEFORE UPDATE ON thong_bao FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ================= INDEXES =================
CREATE UNIQUE INDEX idx_ke_khai_ho_unique ON ke_khai_ho(dot_id, ho_dan_id, phien_ban);
CREATE UNIQUE INDEX idx_ke_khai_thon_unique ON ke_khai_thon(dot_id, thon_id);
CREATE INDEX idx_nguoi_dung_vai_tro ON nguoi_dung(vai_tro);
CREATE INDEX idx_nguoi_dung_thon ON nguoi_dung(thon_id);
CREATE INDEX idx_ho_dan_thon ON ho_dan(thon_id);
CREATE INDEX idx_ho_dan_trang_thai ON ho_dan(trang_thai);
CREATE INDEX idx_ke_khai_ho_dot ON ke_khai_ho(dot_id);
CREATE INDEX idx_ke_khai_ho_ho_dan ON ke_khai_ho(ho_dan_id);
CREATE INDEX idx_ke_khai_thon_dot ON ke_khai_thon(dot_id);
CREATE INDEX idx_thong_bao_nguoi_nhan ON thong_bao(nguoi_nhan_id);
CREATE INDEX idx_thong_bao_da_doc ON thong_bao(da_doc);
CREATE INDEX idx_minh_chung_ke_khai_ho ON minh_chung(ke_khai_ho_id);
CREATE INDEX idx_minh_chung_ke_khai_thon ON minh_chung(ke_khai_thon_id);
CREATE INDEX idx_minh_chung_chi_tieu ON minh_chung(ma_chi_tieu);
CREATE INDEX idx_minh_chung_da_xoa ON minh_chung(da_xoa);
CREATE INDEX idx_nhat_ky_nguoi_dung ON nhat_ky(nguoi_dung_id);
CREATE INDEX idx_nhat_ky_bang ON nhat_ky(bang_lien_quan, ban_ghi_id);
CREATE INDEX idx_dinh_kem_dot_dot ON dinh_kem_dot(dot_id);
CREATE INDEX idx_dinh_kem_dot_da_xoa ON dinh_kem_dot(da_xoa);
CREATE INDEX idx_refresh_token_nguoi_dung ON refresh_token(nguoi_dung_id);
CREATE INDEX idx_refresh_token_hash ON refresh_token(token_hash);
CREATE INDEX idx_truy_cap_nguoi_dung ON nhat_ky_truy_cap(nguoi_dung_id);
CREATE INDEX idx_truy_cap_bang ON nhat_ky_truy_cap(bang_lien_quan, ban_ghi_id, created_at);
