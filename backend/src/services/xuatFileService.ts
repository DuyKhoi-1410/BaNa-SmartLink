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

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Ba Na SmartLink'
  workbook.created = new Date()

  // === Sheet 1: Tổng hợp toàn xã ===
  const ws = workbook.addWorksheet('Tổng hợp xã', {
    properties: { defaultColWidth: 16 },
  })

  // Tiêu đề chính
  ws.mergeCells('A1', `${String.fromCharCode(65 + duLieuThon.length + 2)}1`)
  const cellTieuDe = ws.getCell('A1')
  cellTieuDe.value = 'BÁO CÁO TỔNG HỢP KÊ KHAI DỮ LIỆU'
  cellTieuDe.font = { name: 'Times New Roman', size: 16, bold: true, color: mauXanh }
  cellTieuDe.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 36

  // Thông tin đợt
  ws.mergeCells('A2', `${String.fromCharCode(65 + duLieuThon.length + 2)}2`)
  const cellDot = ws.getCell('A2')
  cellDot.value = `${dotKeKhai.ten_dot} — Từ ${dinhDangNgay(dotKeKhai.ngay_bat_dau)} đến ${dinhDangNgay(dotKeKhai.ngay_ket_thuc)}`
  cellDot.font = { name: 'Times New Roman', size: 11, italic: true, color: { argb: 'FF64748B' } }
  cellDot.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(2).height = 24

  // Dòng trống
  ws.getRow(3).height = 10

  // Header bảng: STT | Chỉ tiêu | Thôn 1 | Thôn 2 | ... | Tổng xã
  const headerRow = ws.getRow(4)
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

  // Dữ liệu từng CT
  danhSachCT.forEach((ct, index) => {
    const rowNum = 5 + index
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
  const rowTienDo = ws.getRow(5 + danhSachCT.length + 1)
  rowTienDo.height = 26
  ws.getRow(5 + danhSachCT.length).height = 10

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

  // === Sheet 2: Chi tiết từng thôn ===
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

    // Data
    danhSachCT.forEach((ct, i) => {
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
      const rowSkip = wsThon.getRow(5 + danhSachCT.length)
      rowSkip.height = 8

      const tdRow = wsThon.getRow(5 + danhSachCT.length + 1)
      wsThon.mergeCells(tdRow.number, 1, tdRow.number, 4)
      const tdCell = tdRow.getCell(1)
      tdCell.value = `Tiến độ: ${td.da_duyet}/${td.tong_ho} hộ đã duyệt — ${td.da_ke_khai} đã kê khai — ${td.tra_lai} trả lại`
      tdCell.font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: 'FF059669' } }
      tdCell.alignment = { horizontal: 'center', vertical: 'middle' }
      tdCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }
      tdRow.height = 26
    }
  }

  return { workbook, tenFile: `BaoCao_${dotKeKhai.ten_dot.replace(/\s+/g, '_')}_${Date.now()}.xlsx` }
}
