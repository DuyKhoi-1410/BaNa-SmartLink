import 'dotenv/config'
import bcrypt from 'bcrypt'
import { query } from './repositories/db.js'
import pool from './repositories/db.js'

// Mat khau lay tu env (hash bcrypt truoc khi luu DB, KHONG luu plaintext)
const MK_XA = process.env.SEED_MAT_KHAU_XA || 'demo123'
const MK_DAN = process.env.SEED_MAT_KHAU_DAN || 'danmat1'

// Du lieu theo file USER DEMO.xlsx
const CAN_BO_THON = [
  { ten_dn: 'canbothon1', ho_ten: 'Tran Huu Duc', mk: 'demo123' },
  { ten_dn: 'canbothon2', ho_ten: 'Le Quang Vinh', mk: 'demo123' },
  { ten_dn: 'canbothon3', ho_ten: 'Pham Minh Tuan', mk: 'demo123' },
  { ten_dn: 'canbothon4', ho_ten: 'Vo Dinh Hoang', mk: 'demo123' },
  { ten_dn: 'canbothon5', ho_ten: 'Nguyen Van Tai', mk: 'demo123' },
  { ten_dn: 'canbothon6', ho_ten: 'Dang Quoc Bao', mk: 'demo123' },
  { ten_dn: 'canbothon7', ho_ten: 'Huynh Ngoc Son', mk: 'demo123' },
  { ten_dn: 'canbothon8', ho_ten: 'Le Thanh Phong', mk: 'demo123' },
  { ten_dn: 'canbothon9', ho_ten: 'Tran Quang Huy', mk: 'demo123' },
  { ten_dn: 'canbothon10', ho_ten: 'Pham Duc Thinh', mk: 'demo123' },
]

const DAN = [
  { ho_ten: 'Le Van An', cccd: '048025000001', sdt: '0901000001' },
  { ho_ten: 'Pham Thi Binh', cccd: '048025000002', sdt: '0901000002' },
  { ho_ten: 'Vo Van Cuong', cccd: '048025000003', sdt: '0901000003' },
  { ho_ten: 'Nguyen Thi Dao', cccd: '048025000004', sdt: '0901000004' },
  { ho_ten: 'Tran Van Em', cccd: '048025000005', sdt: '0901000005' },
  { ho_ten: 'Huynh Van Phuc', cccd: '048025000006', sdt: '0901000006' },
  { ho_ten: 'Dang Thi Giang', cccd: '048025000007', sdt: '0901000007' },
  { ho_ten: 'Le Van Hai', cccd: '048025000008', sdt: '0901000008' },
  { ho_ten: 'Pham Van Ich', cccd: '048025000009', sdt: '0901000009' },
  { ho_ten: 'Vo Thi Kim', cccd: '048025000010', sdt: '0901000010' },
  { ho_ten: 'Nguyen Van Lam', cccd: '048025000011', sdt: '0901000011' },
  { ho_ten: 'Tran Thi Mai', cccd: '048025000012', sdt: '0901000012' },
  { ho_ten: 'Le Van Nam', cccd: '048025000013', sdt: '0901000013' },
  { ho_ten: 'Pham Van Oanh', cccd: '048025000014', sdt: '0901000014' },
  { ho_ten: 'Vo Van Phong', cccd: '048025000015', sdt: '0901000015' },
  { ho_ten: 'Nguyen Thi Quyen', cccd: '048025000016', sdt: '0901000016' },
  { ho_ten: 'Tran Van Sang', cccd: '048025000017', sdt: '0901000017' },
  { ho_ten: 'Le Thi Thanh', cccd: '048025000018', sdt: '0901000018' },
  { ho_ten: 'Pham Van Ut', cccd: '048025000019', sdt: '0901000019' },
  { ho_ten: 'Vo Thi Van', cccd: '048025000020', sdt: '0901000020' },
  { ho_ten: 'Nguyen Van Xuan', cccd: '048025000021', sdt: '0901000021' },
  { ho_ten: 'Tran Van Yen', cccd: '048025000022', sdt: '0901000022' },
  { ho_ten: 'Le Van Dung', cccd: '048025000023', sdt: '0901000023' },
  { ho_ten: 'Pham Thi Hue', cccd: '048025000024', sdt: '0901000024' },
  { ho_ten: 'Vo Van Tien', cccd: '048025000025', sdt: '0901000025' },
  { ho_ten: 'Nguyen Thi Lan', cccd: '048025000026', sdt: '0901000026' },
  { ho_ten: 'Tran Van Minh', cccd: '048025000027', sdt: '0901000027' },
  { ho_ten: 'Le Thi Ngoc', cccd: '048025000028', sdt: '0901000028' },
  { ho_ten: 'Pham Van Hung', cccd: '048025000029', sdt: '0901000029' },
  { ho_ten: 'Vo Thi Thao', cccd: '048025000030', sdt: '0901000030' },
]

async function seed() {
  try {
    console.log('Seeding database (theo USER DEMO.xlsx)...')

    // 1. 10 thon
    const danhSachThon = [
      'Phú Hoà', 'Thái Lai', 'Phước Khương', 'Hoà Nhơn', 'Sơn Phước',
      'Hoà Ninh', 'An Sơn', 'Thạch Nham Đông', 'Thạch Nham Tây', 'Phước Hưng',
    ]
    for (let i = 0; i < danhSachThon.length; i++) {
      await query(
        `INSERT INTO thon (ten_thon, ma_thon) VALUES ($1, $2) ON CONFLICT (ma_thon) DO NOTHING`,
        [danhSachThon[i], `T${String(i + 1).padStart(2, '0')}`]
      )
    }
    const thonRows = (await query(`SELECT * FROM thon ORDER BY id`)).rows
    console.log('  - 10 thon')

    // 2. Can bo xa
    const hashXa = await bcrypt.hash(MK_XA, 10)
    await query(
      `INSERT INTO nguoi_dung (ho_ten, vai_tro, ten_dang_nhap, mat_khau_hash) VALUES ($1,'xa',$2,$3) ON CONFLICT (ten_dang_nhap) DO NOTHING`,
      ['Nguyen Thanh Tung', 'canboxa', hashXa]
    )
    console.log(`  - Can bo xa: canboxa / ${MK_XA}`)

    // 3. 10 can bo thon (ten + mat khau rieng theo Excel)
    for (let i = 0; i < CAN_BO_THON.length; i++) {
      const cb = CAN_BO_THON[i]
      const hash = await bcrypt.hash(cb.mk, 10)
      await query(
        `INSERT INTO nguoi_dung (ho_ten, vai_tro, thon_id, ten_dang_nhap, mat_khau_hash) VALUES ($1,'thon',$2,$3,$4) ON CONFLICT (ten_dang_nhap) DO NOTHING`,
        [cb.ho_ten, thonRows[i].id, cb.ten_dn, hash]
      )
    }
    console.log('  - 10 can bo thon (canbothon1..10 / demo123)')

    // 4. 30 dan (3 nguoi/thon), mat khau chung MK_DAN
    const hashDan = await bcrypt.hash(MK_DAN, 10)
    for (let i = 0; i < DAN.length; i++) {
      const d = DAN[i]
      const thonIdx = Math.floor(i / 3)
      await query(
        `INSERT INTO nguoi_dung (ho_ten, cccd, so_dien_thoai, vai_tro, thon_id, mat_khau_hash) VALUES ($1,$2,$3,'dan',$4,$5) ON CONFLICT (cccd) DO NOTHING`,
        [d.ho_ten, d.cccd, d.sdt, thonRows[thonIdx].id, hashDan]
      )
    }
    console.log('  - 30 nguoi dan')

    // 5. Ho dan (moi dan 1 ho)
    const danRows = (await query(`SELECT * FROM nguoi_dung WHERE vai_tro='dan' ORDER BY id`)).rows
    for (const dan of danRows) {
      await query(
        `INSERT INTO ho_dan (chu_ho_id, thon_id, dia_chi) SELECT $1,$2,$3 WHERE NOT EXISTS (SELECT 1 FROM ho_dan WHERE chu_ho_id=$1)`,
        [dan.id, dan.thon_id, `So nha ${dan.id}, ${dan.ho_ten}`]
      )
    }
    console.log('  - 30 ho dan')

    // 6. 2 dot ke khai
    await query(
      `INSERT INTO dot_ke_khai (ten_dot, mo_ta, loai, quy, nam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
       SELECT 'Ke khai Quy 2/2025','Dot dinh ky quy 2/2025','dinh_ky',2,2025,'2025-04-01','2025-06-30','da_dong'
       WHERE NOT EXISTS (SELECT 1 FROM dot_ke_khai WHERE ten_dot='Ke khai Quy 2/2025')`
    )
    await query(
      `INSERT INTO dot_ke_khai (ten_dot, mo_ta, loai, quy, nam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
       SELECT 'Ke khai Quy 3/2025','Dot dinh ky quy 3/2025','dinh_ky',3,2025,'2025-07-01','2025-09-30','dang_mo'
       WHERE NOT EXISTS (SELECT 1 FROM dot_ke_khai WHERE ten_dot='Ke khai Quy 3/2025')`
    )
    const dotRows = (await query(`SELECT * FROM dot_ke_khai ORDER BY id`)).rows
    console.log('  - 2 dot ke khai')

    // 7. Ke khai ho cho dot 1 (10 ho dau, da_duyet) - du lieu mau CT02-CT11
    const hoDanRows = (await query(`SELECT * FROM ho_dan ORDER BY id`)).rows
    for (let i = 0; i < Math.min(10, hoDanRows.length); i++) {
      const ho = hoDanRows[i]
      await query(
        `INSERT INTO ke_khai_ho (dot_id, ho_dan_id, ct02_tong_nhan_khau, ct03_ho_ngheo, ct04_ho_can_ngheo, ct05_nguoi_co_cong, ct06_bao_tro_xh, ct07_tre_duoi_16, ct08_tre_hoan_canh, ct10_tuoi_lao_dong, ct11_tham_gia_bhyt, trang_thai, nguoi_ke_khai_id, ngay_ke_khai, nguoi_duyet_id, ngay_duyet)
         SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'da_duyet',$12, NOW() - interval '30 days', $12, NOW() - interval '25 days'
         WHERE NOT EXISTS (SELECT 1 FROM ke_khai_ho WHERE dot_id=$1 AND ho_dan_id=$2)`,
        [dotRows[0].id, ho.id, 4 + (i % 3), i % 5 === 0 ? 1 : 0, i % 7 === 0 ? 1 : 0, i % 4 === 0 ? 1 : 0, i % 6 === 0 ? 1 : 0, 1 + (i % 2), i % 8 === 0 ? 1 : 0, 2 + (i % 2), 3 + (i % 2), ho.chu_ho_id]
      )
    }
    console.log('  - 10 ke khai ho (dot 1, da_duyet)')

    // 8. Ke khai thon cho 3 thon dau (dot 1)
    for (let i = 0; i < 3; i++) {
      await query(
        `INSERT INTO ke_khai_thon (dot_id, thon_id, ct09_gia_dinh_van_hoa, ct12_thanh_vien_to_cnsc, ct13_huong_dan_dvc, ct14_bao_luc_gia_dinh, trang_thai, ngay_nhap)
         SELECT $1,$2,$3,$4,$5,$6,'da_nop_xa', NOW() - interval '20 days'
         WHERE NOT EXISTS (SELECT 1 FROM ke_khai_thon WHERE dot_id=$1 AND thon_id=$2)`,
        [dotRows[0].id, thonRows[i].id, 2 + i, 5 + i, 3 + i, i % 2]
      )
    }
    console.log('  - 3 ke khai thon (dot 1)')

    // 9. Thong bao mau
    const canBoXa = (await query(`SELECT * FROM nguoi_dung WHERE vai_tro='xa' LIMIT 1`)).rows[0]
    if (canBoXa && danRows.length > 0) {
      for (let i = 0; i < 5; i++) {
        await query(
          `INSERT INTO thong_bao (tieu_de, noi_dung, loai, nguoi_gui_id, nguoi_nhan_id, dot_id) VALUES ($1,$2,'he_thong',$3,$4,$5)`,
          [`Thong bao dot ke khai ${i + 1}`, `Vui long thuc hien ke khai dung han.`, canBoXa.id, danRows[i % danRows.length].id, dotRows[0].id]
        )
      }
      console.log('  - 5 thong bao')
    }

    console.log('\nSeed hoan tat!')
    console.log('=== TAI KHOAN TEST (theo Excel) ===')
    console.log(`Can bo xa:   canboxa / ${MK_XA}`)
    console.log(`Can bo thon: canbothon1..10 / demo123`)
    console.log(`Nguoi dan:   CCCD 048025000001..030 + ho ten (mat khau: ${MK_DAN})`)
  } catch (err: any) {
    console.error('Seed error:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
