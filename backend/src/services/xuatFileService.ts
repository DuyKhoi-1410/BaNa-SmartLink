import ExcelJS from 'exceljs'
import * as keKhaiService from './keKhaiService.js'
import * as dotKeKhaiRepo from '../repositories/dotKeKhaiRepo.js'

const danhSachCT = [
  { key: 'ct01_tong_ho', ma: 'CT01', ten: 'Tổng số hộ dân' },
  { key: 'ct02_tong_nhan_khau', ma: 'CT02', ten: 'Tổng số nhân khẩu' },
  { key: 'ct03_ho_ngheo', ma: 'CT03', ten: 'Số hộ nghèo' },
  { key: 'ct04_ho_can_ngheo', ma: 'CT04', ten: 'Số hộ cận nghèo' },
  { key: 'ct05_nguoi_co_cong', ma: 'CT05', ten: 'Số người có công với CM' },
  { key: 'ct06_bao_tro_xh', ma: 'CT06', ten: 'Đối tượng bảo trợ XH' },
  { key: 'ct07_tre_duoi_16', ma: 'CT07', ten: 'Số trẻ em dưới 16 tuổi' },
  { key: 'ct08_tre_hoan_canh', ma: 'CT08', ten: 'Trẻ em có hoàn cảnh đặc biệt' },
  { key: 'ct09_gia_dinh_van_hoa', ma: 'CT09', ten: 'Số hộ đạt "Gia đình văn hóa"' },
  { key: 'ct10_tuoi_lao_dong', ma: 'CT10', ten: 'Số người trong độ tuổi lao động' },
  { key: 'ct11_tham_gia_bhyt', ma: 'CT11', ten: 'Số người tham gia BHYT' },
  { key: 'ct12_thanh_vien_to_cnsc', ma: 'CT12', ten: 'Thành viên Tổ CNSCĐ' },
  { key: 'ct13_huong_dan_dvc', ma: 'CT13', ten: 'Người được hướng dẫn DVC trực tuyến' },
  { key: 'ct14_bao_luc_gia_dinh', ma: 'CT14', ten: 'Số vụ bạo lực gia đình' },
]

const mauXanh = { argb: 'FF2563EB' }
const mauXanhNhat = { argb: 'FFDBEAFE' }
const mauTrang = { argb: 'FFFFFFFF' }
const mauXam = { argb: 'FFF1F5F9' }
const mauVang = { argb: 'FFFFFBEB' }

function dinhDangNgay(ngay) {
  if (!ngay) return ''
  const d = new Date(ngay)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function boVien(cell) {
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  }
}

export async function xuatExcelTongHop(dotId) {
  const dotKeKhai = await dotKeKhaiRepo.timTheoId(dotId)
  if (!dotKeKhai) throw new Error('Không tìm thấy đợt kê khai')

  const duLieuThon = await keKhaiService.tongHopXa(dotId)

  // Lọc CT theo đợt: nếu đợt có chi_tieu thì chỉ xuất những CT đó, không thì xuất tất cả
  const chiTieuDot: string[] | null = dotKeKhai.chi_tieu
  const danhSachCTXuat = chiTieuDot && chiTieuDot.length > 0
    ? danhSachCT.filter(ct => chiTieuDot.includes(ct.ma))
    : danhSachCT

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Ba Na SmartLink'
  workbook.created = new Date()

  // === Sheet 1: Tổng hợp toàn xã ===
  const ws = workbook.addWorksheet('Tổng hợp xã', {
    properties: { defaultColWidth: 16 },
  })

  const cotCuoi = String.fromCharCode(65 + duLieuThon.length + 2)
  const loaiBaoCao = dotKeKhai.loai === 'dinh_ky' ? 'Định kỳ' : 'Đột xuất'

  // Tiêu đề chính
  ws.mergeCells('A1', `${cotCuoi}1`)
  const cellTieuDe = ws.getCell('A1')
  cellTieuDe.value = `BÁO CÁO ${dotKeKhai.ten_dot.toUpperCase()}`
  cellTieuDe.font = { name: 'Times New Roman', size: 16, bold: true, color: mauXanh }
  cellTieuDe.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 36

  // Loại + thời gian
  ws.mergeCells('A2', `${cotCuoi}2`)
  const cellDot = ws.getCell('A2')
  cellDot.value = `Loại: ${loaiBaoCao}  |  Từ ${dinhDangNgay(dotKeKhai.ngay_bat_dau)} đến ${dinhDangNgay(dotKeKhai.ngay_ket_thuc)}`
  cellDot.font = { name: 'Times New Roman', size: 11, italic: true, color: { argb: 'FF64748B' } }
  cellDot.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(2).height = 24

  // Mô tả + ngày xuất
  ws.mergeCells('A3', `${cotCuoi}3`)
  const cellMoTa = ws.getCell('A3')
  const moTaParts = []
  if (dotKeKhai.mo_ta) moTaParts.push(dotKeKhai.mo_ta)
  moTaParts.push(`Ngày xuất: ${dinhDangNgay(new Date())}`)
  cellMoTa.value = moTaParts.join('  |  ')
  cellMoTa.font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: 'FF94A3B8' } }
  cellMoTa.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(3).height = 22

  // Dòng trống
  ws.getRow(4).height = 10

  // Header bảng: STT | Chỉ tiêu | Thôn 1 | Thôn 2 | ... | Tổng xã
  const headerRow = ws.getRow(5)
  headerRow.height = 32

  const tongSoCot = duLieuThon.length + 3 // STT + Chỉ tiêu + N thôn + Tổng

  ws.getColumn(1).width = 6
  ws.getColumn(2).width = 38

  const headerValues = ['STT', 'Chỉ tiêu']
  duLieuThon.forEach(t => headerValues.push(t.ten_thon))
  headerValues.push('TỔNG XÃ')
  headerRow.values = headerValues

  for (let col = 1; col <= tongSoCot; col++) {
    const cell = headerRow.getCell(col)
    cell.font = { name: 'Times New Roman', size: 11, bold: true, color: mauTrang }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXanh }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    boVien(cell)
    if (col > 2) ws.getColumn(col).width = 16
  }

  // Dữ liệu từng CT (chỉ xuất CT đã chọn)
  danhSachCTXuat.forEach((ct, index) => {
    const rowNum = 6 + index
    const row = ws.getRow(rowNum)
    row.height = 26

    const tongXa = duLieuThon.reduce((s, t) => s + (parseInt(t[ct.key]) || 0), 0)

    const values = [index + 1, `${ct.ma} — ${ct.ten}`]
    duLieuThon.forEach(t => values.push(parseInt(t[ct.key]) || 0))
    values.push(tongXa)
    row.values = values

    const laMauNen = index % 2 === 0
    for (let col = 1; col <= tongSoCot; col++) {
      const cell = row.getCell(col)
      cell.font = { name: 'Times New Roman', size: 11 }
      cell.alignment = { horizontal: col <= 2 ? 'left' : 'center', vertical: 'middle' }
      boVien(cell)

      if (col === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.font = { name: 'Times New Roman', size: 10, color: { argb: 'FF94A3B8' } }
      }

      if (col === tongSoCot) {
        cell.font = { name: 'Times New Roman', size: 11, bold: true, color: mauXanh }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauVang }
      } else if (laMauNen) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXam }
      }
    }
  })

  // Dòng tổng tiến độ
  const rowTienDo = ws.getRow(6 + danhSachCTXuat.length + 1)
  rowTienDo.height = 26
  ws.getRow(6 + danhSachCTXuat.length).height = 10

  const tienDoValues = ['', 'Tiến độ kê khai']
  duLieuThon.forEach(t => {
    const td = t.tien_do
    if (td) {
      tienDoValues.push(`${td.da_duyet}/${td.tong_ho} hộ`)
    } else {
      tienDoValues.push('—')
    }
  })
  const tongDuyet = duLieuThon.reduce((s, t) => s + (parseInt(t.tien_do?.da_duyet) || 0), 0)
  const tongHo = duLieuThon.reduce((s, t) => s + (parseInt(t.tien_do?.tong_ho) || 0), 0)
  tienDoValues.push(`${tongDuyet}/${tongHo} hộ`)
  rowTienDo.values = tienDoValues

  for (let col = 1; col <= tongSoCot; col++) {
    const cell = rowTienDo.getCell(col)
    cell.font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: 'FF059669' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    boVien(cell)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }
  }
  rowTienDo.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' }
  rowTienDo.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true, italic: true, color: { argb: 'FF059669' } }

  // === Sheet 2: Phân tích & Thống kê (Dashboard) ===
  const wsPT = workbook.addWorksheet('Phân tích', { properties: { defaultColWidth: 18 } })

  // --- Tiêu đề ---
  wsPT.mergeCells('A1:H1')
  const ptTieuDe = wsPT.getCell('A1')
  ptTieuDe.value = `PHÂN TÍCH & THỐNG KÊ — ${dotKeKhai.ten_dot.toUpperCase()}`
  ptTieuDe.font = { name: 'Times New Roman', size: 15, bold: true, color: mauXanh }
  ptTieuDe.alignment = { horizontal: 'center', vertical: 'middle' }
  wsPT.getRow(1).height = 36

  wsPT.mergeCells('A2:H2')
  const ptPhu = wsPT.getCell('A2')
  ptPhu.value = `Loại: ${loaiBaoCao}  |  Từ ${dinhDangNgay(dotKeKhai.ngay_bat_dau)} đến ${dinhDangNgay(dotKeKhai.ngay_ket_thuc)}  |  Ngày xuất: ${dinhDangNgay(new Date())}`
  ptPhu.font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: 'FF94A3B8' } }
  ptPhu.alignment = { horizontal: 'center', vertical: 'middle' }
  wsPT.getRow(2).height = 22

  wsPT.getRow(3).height = 10

  // --- Phần A: Tổng quan (KPI cards) ---
  const mauKPI = { argb: 'FFF0F9FF' }
  const tongHoXa = duLieuThon.reduce((s, t) => s + (parseInt(t.ct01_tong_ho) || 0), 0)
  const tongNKXa = duLieuThon.reduce((s, t) => s + (parseInt(t.ct02_tong_nhan_khau) || 0), 0)
  const tongDuyetXa = duLieuThon.reduce((s, t) => s + (parseInt(t.tien_do?.da_duyet) || 0), 0)
  const tongHoTienDo = duLieuThon.reduce((s, t) => s + (parseInt(t.tien_do?.tong_ho) || 0), 0)
  const tongKeKhai = duLieuThon.reduce((s, t) => s + (parseInt(t.tien_do?.da_ke_khai) || 0), 0)
  const tongTraLai = duLieuThon.reduce((s, t) => s + (parseInt(t.tien_do?.tra_lai) || 0), 0)
  const tiLeDuyet = tongHoTienDo > 0 ? Math.round((tongDuyetXa / tongHoTienDo) * 1000) / 10 : 0

  wsPT.mergeCells('A4:H4')
  const ptSecA = wsPT.getCell('A4')
  ptSecA.value = 'TỔNG QUAN'
  ptSecA.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FF1E40AF' } }
  ptSecA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
  ptSecA.alignment = { horizontal: 'left', vertical: 'middle' }
  wsPT.getRow(4).height = 28

  const kpiData = [
    ['Tổng số hộ dân', tongHoXa, 'Tổng nhân khẩu', tongNKXa],
    ['Đã duyệt', `${tongDuyetXa}/${tongHoTienDo} hộ (${tiLeDuyet}%)`, 'Đã kê khai', `${tongKeKhai}/${tongHoTienDo} hộ`],
    ['Trả lại', tongTraLai, 'Số thôn', duLieuThon.length],
  ]

  kpiData.forEach((kpiRow, i) => {
    const row = wsPT.getRow(5 + i)
    row.height = 26
    for (let k = 0; k < 4; k++) {
      const col = k < 2 ? k + 1 : k + 3
      const cell = row.getCell(col)
      cell.value = kpiRow[k]
      if (k % 2 === 0) {
        cell.font = { name: 'Times New Roman', size: 10, color: { argb: 'FF64748B' } }
      } else {
        cell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FF1E293B' } }
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauKPI }
      cell.alignment = { vertical: 'middle' }
      boVien(cell)
    }
    wsPT.mergeCells(row.number, 1, row.number, 2)
    wsPT.mergeCells(row.number, 3, row.number, 4)
    wsPT.mergeCells(row.number, 5, row.number, 6)
    wsPT.mergeCells(row.number, 7, row.number, 8)
  })

  // --- Phần B: Tiến độ theo thôn ---
  let ptRow = 9
  wsPT.getRow(ptRow).height = 10
  ptRow++

  wsPT.mergeCells(`A${ptRow}:H${ptRow}`)
  const ptSecB = wsPT.getCell(`A${ptRow}`)
  ptSecB.value = 'TIẾN ĐỘ THEO THÔN'
  ptSecB.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FF1E40AF' } }
  ptSecB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
  ptSecB.alignment = { horizontal: 'left', vertical: 'middle' }
  wsPT.getRow(ptRow).height = 28
  ptRow++

  const tdHeader = wsPT.getRow(ptRow)
  tdHeader.values = ['Thôn', '', 'Tổng hộ', 'Đã kê khai', 'Đã duyệt', 'Trả lại', 'Tỷ lệ duyệt', '']
  tdHeader.height = 26
  wsPT.mergeCells(ptRow, 1, ptRow, 2)
  for (let col = 1; col <= 7; col++) {
    const cell = tdHeader.getCell(col)
    cell.font = { name: 'Times New Roman', size: 10, bold: true, color: mauTrang }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXanh }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    boVien(cell)
  }
  ptRow++

  duLieuThon.forEach((thon, i) => {
    const row = wsPT.getRow(ptRow)
    const td = thon.tien_do || {}
    const tgHo = parseInt(td.tong_ho) || 0
    const daDuyet = parseInt(td.da_duyet) || 0
    const daKK = parseInt(td.da_ke_khai) || 0
    const tl = parseInt(td.tra_lai) || 0
    const tiLe = tgHo > 0 ? Math.round((daDuyet / tgHo) * 1000) / 10 : 0

    row.values = [thon.ten_thon, '', tgHo, daKK, daDuyet, tl, `${tiLe}%`, '']
    row.height = 24
    wsPT.mergeCells(ptRow, 1, ptRow, 2)

    for (let col = 1; col <= 7; col++) {
      const cell = row.getCell(col)
      cell.font = { name: 'Times New Roman', size: 10 }
      cell.alignment = { horizontal: col <= 2 ? 'left' : 'center', vertical: 'middle' }
      boVien(cell)
      if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXam }
      if (col === 7) {
        cell.font = { name: 'Times New Roman', size: 10, bold: true, color: tiLe >= 100 ? { argb: 'FF059669' } : tiLe >= 50 ? { argb: 'FFD97706' } : { argb: 'FFDC2626' } }
      }
    }
    ptRow++
  })

  // --- Phần C: Tỷ lệ % chỉ tiêu theo thôn ---
  ptRow++
  wsPT.getRow(ptRow).height = 10
  ptRow++

  wsPT.mergeCells(`A${ptRow}:H${ptRow}`)
  const ptSecC = wsPT.getCell(`A${ptRow}`)
  ptSecC.value = 'TỶ LỆ CHỈ TIÊU THEO THÔN (% so với tổng hộ)'
  ptSecC.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FF1E40AF' } }
  ptSecC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
  ptSecC.alignment = { horizontal: 'left', vertical: 'middle' }
  wsPT.getRow(ptRow).height = 28
  ptRow++

  const ctCoTyLe = danhSachCTXuat.filter(ct => ct.ma !== 'CT01' && ct.ma !== 'CT02')
  const soCotTL = Math.min(duLieuThon.length + 2, 12)

  const tlHeader = wsPT.getRow(ptRow)
  const tlHValues = ['Chỉ tiêu', '']
  duLieuThon.slice(0, soCotTL - 2).forEach(t => tlHValues.push(t.ten_thon))
  tlHeader.values = tlHValues
  tlHeader.height = 28
  wsPT.mergeCells(ptRow, 1, ptRow, 2)
  for (let col = 1; col <= soCotTL; col++) {
    const cell = tlHeader.getCell(col)
    cell.font = { name: 'Times New Roman', size: 10, bold: true, color: mauTrang }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXanh }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    boVien(cell)
  }
  ptRow++

  ctCoTyLe.forEach((ct, i) => {
    const row = wsPT.getRow(ptRow)
    const vals = [`${ct.ma} — ${ct.ten}`, '']
    duLieuThon.slice(0, soCotTL - 2).forEach(thon => {
      const tongHoThon = parseInt(thon.ct01_tong_ho) || 1
      const giaTriCT = parseInt(thon[ct.key]) || 0
      const pct = Math.round((giaTriCT / tongHoThon) * 1000) / 10
      vals.push(`${pct}%`)
    })
    row.values = vals
    row.height = 24
    wsPT.mergeCells(ptRow, 1, ptRow, 2)

    for (let col = 1; col <= soCotTL; col++) {
      const cell = row.getCell(col)
      cell.font = { name: 'Times New Roman', size: 10 }
      cell.alignment = { horizontal: col <= 2 ? 'left' : 'center', vertical: 'middle' }
      boVien(cell)
      if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXam }
    }
    ptRow++
  })

  // --- Phần D: Xếp hạng thôn (Top cao nhất / thấp nhất) ---
  ptRow++
  wsPT.getRow(ptRow).height = 10
  ptRow++

  wsPT.mergeCells(`A${ptRow}:H${ptRow}`)
  const ptSecD = wsPT.getCell(`A${ptRow}`)
  ptSecD.value = 'XẾP HẠNG THÔN THEO CHỈ TIÊU'
  ptSecD.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FF1E40AF' } }
  ptSecD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
  ptSecD.alignment = { horizontal: 'left', vertical: 'middle' }
  wsPT.getRow(ptRow).height = 28
  ptRow++

  const xhHeader = wsPT.getRow(ptRow)
  xhHeader.values = ['Chỉ tiêu', '', 'Top 1', 'Giá trị', 'Top 2', 'Giá trị', 'Top 3', 'Giá trị']
  xhHeader.height = 26
  wsPT.mergeCells(ptRow, 1, ptRow, 2)
  for (let col = 1; col <= 8; col++) {
    const cell = xhHeader.getCell(col)
    cell.font = { name: 'Times New Roman', size: 10, bold: true, color: mauTrang }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXanh }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    boVien(cell)
  }
  ptRow++

  danhSachCTXuat.forEach((ct, i) => {
    const sorted = duLieuThon
      .map(t => ({ ten: t.ten_thon, giaTri: parseInt(t[ct.key]) || 0 }))
      .filter(t => t.giaTri > 0)
      .sort((a, b) => b.giaTri - a.giaTri)

    const row = wsPT.getRow(ptRow)
    const vals = [`${ct.ma} — ${ct.ten}`, '']
    for (let k = 0; k < 3; k++) {
      if (sorted[k]) {
        vals.push(sorted[k].ten, String(sorted[k].giaTri))
      } else {
        vals.push('—', '')
      }
    }
    row.values = vals
    row.height = 24
    wsPT.mergeCells(ptRow, 1, ptRow, 2)

    for (let col = 1; col <= 8; col++) {
      const cell = row.getCell(col)
      cell.font = { name: 'Times New Roman', size: 10 }
      cell.alignment = { horizontal: col <= 2 ? 'left' : 'center', vertical: 'middle' }
      boVien(cell)
      if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXam }
      if (col === 3) cell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFD97706' } }
      if (col === 4) cell.font = { name: 'Times New Roman', size: 10, bold: true }
    }
    ptRow++
  })

  // Column widths cho sheet phân tích
  wsPT.getColumn(1).width = 14
  wsPT.getColumn(2).width = 22
  for (let c = 3; c <= 8; c++) wsPT.getColumn(c).width = 16

  // === Sheet 3+: Chi tiết từng thôn ===
  for (const thon of duLieuThon) {
    const wsThon = workbook.addWorksheet(thon.ten_thon, {
      properties: { defaultColWidth: 20 },
    })

    wsThon.mergeCells('A1:D1')
    const cellTen = wsThon.getCell('A1')
    cellTen.value = `CHI TIẾT KÊ KHAI — ${thon.ten_thon.toUpperCase()}`
    cellTen.font = { name: 'Times New Roman', size: 14, bold: true, color: mauXanh }
    cellTen.alignment = { horizontal: 'center', vertical: 'middle' }
    wsThon.getRow(1).height = 32

    wsThon.mergeCells('A2:D2')
    const cellDotThon = wsThon.getCell('A2')
    cellDotThon.value = dotKeKhai.ten_dot
    cellDotThon.font = { name: 'Times New Roman', size: 11, italic: true, color: { argb: 'FF64748B' } }
    cellDotThon.alignment = { horizontal: 'center', vertical: 'middle' }
    wsThon.getRow(2).height = 22

    wsThon.getRow(3).height = 8

    // Header
    wsThon.getColumn(1).width = 6
    wsThon.getColumn(2).width = 10
    wsThon.getColumn(3).width = 40
    wsThon.getColumn(4).width = 18

    const hRow = wsThon.getRow(4)
    hRow.values = ['STT', 'Mã CT', 'Chỉ tiêu', 'Giá trị']
    hRow.height = 28
    for (let col = 1; col <= 4; col++) {
      const cell = hRow.getCell(col)
      cell.font = { name: 'Times New Roman', size: 11, bold: true, color: mauTrang }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXanh }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      boVien(cell)
    }

    // Data (chỉ xuất CT đã chọn)
    danhSachCTXuat.forEach((ct, i) => {
      const row = wsThon.getRow(5 + i)
      row.values = [i + 1, ct.ma, ct.ten, parseInt(thon[ct.key]) || 0]
      row.height = 24

      for (let col = 1; col <= 4; col++) {
        const cell = row.getCell(col)
        cell.font = { name: 'Times New Roman', size: 11 }
        cell.alignment = { horizontal: col <= 3 ? 'left' : 'center', vertical: 'middle' }
        boVien(cell)
        if (col === 1) cell.alignment = { horizontal: 'center', vertical: 'middle' }
        if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: mauXam }
      }
    })

    // Tiến độ
    const td = thon.tien_do
    if (td) {
      const rowSkip = wsThon.getRow(5 + danhSachCTXuat.length)
      rowSkip.height = 8

      const tdRow = wsThon.getRow(5 + danhSachCTXuat.length + 1)
      wsThon.mergeCells(tdRow.number, 1, tdRow.number, 4)
      const tdCell = tdRow.getCell(1)
      tdCell.value = `Tiến độ: ${td.da_duyet}/${td.tong_ho} hộ đã duyệt — ${td.da_ke_khai} đã kê khai — ${td.tra_lai} trả lại`
      tdCell.font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: 'FF059669' } }
      tdCell.alignment = { horizontal: 'center', vertical: 'middle' }
      tdCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }
      tdRow.height = 26
    }
  }

  return { workbook, tenFile: `Báo Cáo ${dotKeKhai.ten_dot}.xlsx` }
}
