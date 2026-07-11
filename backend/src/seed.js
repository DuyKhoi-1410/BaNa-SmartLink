import 'dotenv/config'
import bcrypt from 'bcrypt'
import { query } from './repositories/db.js'
import pool from './repositories/db.js'

async function seed() {
  try {
    console.log('Seeding database...')

    // 1. Tao 10 thon
    const thons = [
      { ten: 'Thon Phu Tuc', ma: 'T01' },
      { ten: 'Thon An Tinh', ma: 'T02' },
      { ten: 'Thon Tan Ninh', ma: 'T03' },
      { ten: 'Thon Hoa Trung', ma: 'T04' },
      { ten: 'Thon Phuoc Hau', ma: 'T05' },
      { ten: 'Thon Ninh An', ma: 'T06' },
      { ten: 'Thon Thai Son', ma: 'T07' },
      { ten: 'Thon Lien Hoa', ma: 'T08' },
      { ten: 'Thon Nam Yen', ma: 'T09' },
      { ten: 'Thon Dong Xuan', ma: 'T10' },
    ]
    for (const t of thons) {
      await query(
        `INSERT INTO thon (ten_thon, ma_thon) VALUES ($1, $2) ON CONFLICT (ma_thon) DO NOTHING`,
        [t.ten, t.ma]
      )
    }
    console.log('  - 10 thon created')

    // Lay thon IDs
    const thonRows = (await query(`SELECT * FROM thon ORDER BY id`)).rows

    // 2. Tao can bo xa
    const mkHash = await bcrypt.hash('123456', 10)
    await query(
      `INSERT INTO nguoi_dung (ho_ten, vai_tro, ten_dang_nhap, mat_khau_hash) VALUES ($1, 'xa', $2, $3) ON CONFLICT (ten_dang_nhap) DO NOTHING`,
      ['Nguyen Van Xa', 'canboxa', mkHash]
    )
    console.log('  - Can bo xa created (canboxa / 123456)')

    // 3. Tao 10 can bo thon (moi thon 1 nguoi)
    for (let i = 0; i < thonRows.length; i++) {
      const tenDN = `canbothon${i + 1}`
      await query(
        `INSERT INTO nguoi_dung (ho_ten, vai_tro, thon_id, ten_dang_nhap, mat_khau_hash) VALUES ($1, 'thon', $2, $3, $4) ON CONFLICT (ten_dang_nhap) DO NOTHING`,
        [`Tran Van Thon ${i + 1}`, thonRows[i].id, tenDN, mkHash]
      )
    }
    console.log('  - 10 can bo thon created (canbothon1..10 / 123456)')

    // 4. Tao 30 nguoi dan (3 nguoi/thon, 10 thon dau)
    const danData = [
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

    const danMkHash = await bcrypt.hash('danmat1', 10)
    for (let i = 0; i < danData.length; i++) {
      const d = danData[i]
      const thonIdx = Math.floor(i / 3)
      await query(
        `INSERT INTO nguoi_dung (ho_ten, cccd, so_dien_thoai, vai_tro, thon_id, mat_khau_hash) VALUES ($1,$2,$3,'dan',$4,$5) ON CONFLICT (cccd) DO NOTHING`,
        [d.ho_ten, d.cccd, d.sdt, thonRows[thonIdx].id, danMkHash]
      )
    }
    console.log('  - 30 nguoi dan created')

    // 5. Tao ho dan
    const danRows = (await query(`SELECT * FROM nguoi_dung WHERE vai_tro = 'dan' ORDER BY id`)).rows
    for (const dan of danRows) {
      await query(
        `INSERT INTO ho_dan (chu_ho_id, thon_id, dia_chi) SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM ho_dan WHERE chu_ho_id = $1)`,
        [dan.id, dan.thon_id, `So nha ${dan.id}, ${dan.ho_ten}`]
      )
    }
    console.log('  - 30 ho dan created')

    // 6. Tao 2 dot ke khai
    await query(
      `INSERT INTO dot_ke_khai (ten_dot, mo_ta, loai, quy, nam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
       SELECT 'Ke khai Quy 2/2025', 'Dot ke khai dinh ky quy 2 nam 2025', 'dinh_ky', 2, 2025, '2025-04-01', '2025-06-30', 'da_dong'
       WHERE NOT EXISTS (SELECT 1 FROM dot_ke_khai WHERE ten_dot = 'Ke khai Quy 2/2025')`
    )
    await query(
      `INSERT INTO dot_ke_khai (ten_dot, mo_ta, loai, quy, nam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
       SELECT 'Ke khai Quy 3/2025', 'Dot ke khai dinh ky quy 3 nam 2025', 'dinh_ky', 3, 2025, '2025-07-01', '2025-09-30', 'dang_mo'
       WHERE NOT EXISTS (SELECT 1 FROM dot_ke_khai WHERE ten_dot = 'Ke khai Quy 3/2025')`
    )
    console.log('  - 2 dot ke khai created')

    // 7. Tao du lieu ke khai cho dot 1 (da dong) - 10 ho dau tien da ke khai + da duyet
    const dotRows = (await query(`SELECT * FROM dot_ke_khai ORDER BY id`)).rows
    const hoDanRows = (await query(`SELECT * FROM ho_dan ORDER BY id`)).rows

    if (dotRows.length > 0 && hoDanRows.length > 0) {
      for (let i = 0; i < Math.min(10, hoDanRows.length); i++) {
        const ho = hoDanRows[i]
        await query(
          `INSERT INTO ke_khai_ho (dot_id, ho_dan_id, ct02_tong_nhan_khau, ct03_ho_ngheo, ct04_ho_can_ngheo, ct05_nguoi_co_cong, ct06_bao_tro_xh, ct07_tre_duoi_16, ct08_tre_hoan_canh, ct10_tuoi_lao_dong, ct11_tham_gia_bhyt, trang_thai, nguoi_ke_khai_id, ngay_ke_khai, nguoi_duyet_id, ngay_duyet)
           SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'da_duyet', $12, NOW() - interval '30 days', $12, NOW() - interval '25 days'
           WHERE NOT EXISTS (SELECT 1 FROM ke_khai_ho WHERE dot_id = $1 AND ho_dan_id = $2)`,
          [dotRows[0].id, ho.id, 4 + i % 3, i % 5 === 0 ? 1 : 0, i % 7 === 0 ? 1 : 0, i % 4 === 0 ? 1 : 0, i % 6 === 0 ? 1 : 0, 1 + i % 2, i % 8 === 0 ? 1 : 0, 2 + i % 2, 3 + i % 2, ho.chu_ho_id]
        )
      }
      console.log('  - 10 ke khai ho (dot 1, da duyet)')
    }

    // 8. Tao ke khai thon cho 3 thon dau (dot 1)
    for (let i = 0; i < 3; i++) {
      await query(
        `INSERT INTO ke_khai_thon (dot_id, thon_id, ct09_gia_dinh_van_hoa, ct12_thanh_vien_to_cnsc, ct13_huong_dan_dvc, ct14_bao_luc_gia_dinh, trang_thai, ngay_nhap)
         SELECT $1, $2, $3, $4, $5, $6, 'da_nop_xa', NOW() - interval '20 days'
         WHERE NOT EXISTS (SELECT 1 FROM ke_khai_thon WHERE dot_id = $1 AND thon_id = $2)`,
        [dotRows[0].id, thonRows[i].id, 2 + i, 5 + i, 3 + i, i % 2]
      )
    }
    console.log('  - 3 ke khai thon (dot 1)')

    // 9. Tao thong bao
    const canBoXa = (await query(`SELECT * FROM nguoi_dung WHERE vai_tro = 'xa' LIMIT 1`)).rows[0]
    if (canBoXa && danRows.length > 0) {
      for (let i = 0; i < 5; i++) {
        await query(
          `INSERT INTO thong_bao (tieu_de, noi_dung, loai, nguoi_gui_id, nguoi_nhan_id, dot_id)
           VALUES ($1, $2, 'he_thong', $3, $4, $5)`,
          [
            `Thong bao dot ke khai ${i + 1}`,
            `Day la thong bao tu he thong ve dot ke khai. Vui long thuc hien ke khai dung han.`,
            canBoXa.id,
            danRows[i % danRows.length].id,
            dotRows.length > 0 ? dotRows[0].id : null,
          ]
        )
      }
      console.log('  - 5 thong bao created')
    }

    console.log('\nSeed completed!')
    console.log('\n=== TAI KHOAN TEST ===')
    console.log('Can bo xa:  canboxa / 123456')
    console.log('Can bo thon: canbothon1..10 / 123456')
    console.log('Nguoi dan:  CCCD 048025000001..030 + ho ten tuong ung')
    console.log('            Mat khau dan: danmat1')
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
