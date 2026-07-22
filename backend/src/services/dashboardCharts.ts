import type { ChartDef } from '../utils/chartRenderer.js'

interface ChiTieu { key: string; ma: string; ten: string }

const CT_XA_HOI = [
  { key: 'ct03_ho_ngheo', ma: 'CT03', ten: 'Hộ nghèo', color: '#EF4444' },
  { key: 'ct04_ho_can_ngheo', ma: 'CT04', ten: 'Cận nghèo', color: '#F59E0B' },
  { key: 'ct05_nguoi_co_cong', ma: 'CT05', ten: 'Người có công', color: '#8B5CF6' },
  { key: 'ct06_bao_tro_xh', ma: 'CT06', ten: 'Bảo trợ XH', color: '#06B6D4' },
]

export function taoBieuDoDashboard(duLieuThon: any[], danhSachCTXuat: ChiTieu[]): ChartDef[] {
  const charts: ChartDef[] = []
  let row = 3

  // Chart 1: Grouped bar — Tiến độ kê khai theo thôn
  const tenThon = duLieuThon.map(t => t.ten_thon)
  charts.push({
    title: 'Tiến Độ Kê Khai Theo Thôn',
    type: 'bar',
    categories: tenThon,
    series: [
      { name: 'Tổng hộ', values: duLieuThon.map(t => t.tien_do?.tong_ho || 0), color: '#2563EB' },
      { name: 'Đã kê khai', values: duLieuThon.map(t => t.tien_do?.da_ke_khai || 0), color: '#F59E0B' },
      { name: 'Đã duyệt', values: duLieuThon.map(t => t.tien_do?.da_duyet || 0), color: '#10B981' },
      { name: 'Trả lại', values: duLieuThon.map(t => t.tien_do?.tra_lai || 0), color: '#EF4444' },
    ],
    fromCol: 1, fromRow: row, toCol: 12, toRow: row + 18,
  })
  row += 20

  // Chart 2: Donut — Tỷ lệ trạng thái toàn xã
  const daDuyet = duLieuThon.reduce((s, t) => s + (t.tien_do?.da_duyet || 0), 0)
  const daKeKhai = duLieuThon.reduce((s, t) => s + (t.tien_do?.da_ke_khai || 0), 0)
  const tongHo = duLieuThon.reduce((s, t) => s + (t.tien_do?.tong_ho || 0), 0)
  const traLai = duLieuThon.reduce((s, t) => s + (t.tien_do?.tra_lai || 0), 0)
  const choDuyet = daKeKhai - daDuyet
  const chuaKeKhai = tongHo - daKeKhai

  const donutCats: string[] = []
  const donutVals: number[] = []
  const donutColors: string[] = []
  if (daDuyet > 0) { donutCats.push('Đã duyệt'); donutVals.push(daDuyet); donutColors.push('#10B981') }
  if (choDuyet > 0) { donutCats.push('Chờ duyệt'); donutVals.push(choDuyet); donutColors.push('#F59E0B') }
  if (chuaKeKhai > 0) { donutCats.push('Chưa kê khai'); donutVals.push(chuaKeKhai); donutColors.push('#94A3B8') }
  if (traLai > 0) { donutCats.push('Trả lại'); donutVals.push(traLai); donutColors.push('#EF4444') }

  if (donutCats.length > 0) {
    charts.push({
      title: 'Tỷ Lệ Trạng Thái Toàn Xã',
      type: 'doughnut',
      categories: donutCats,
      series: donutColors.map((c, i) => ({ name: donutCats[i], values: [donutVals[i]], color: c })),
      fromCol: 1, fromRow: row, toCol: 10, toRow: row + 18,
    })
    row += 20
  }

  // Chart 3: Stacked bar — So sánh chỉ tiêu xã hội
  const maCTXuat = new Set(danhSachCTXuat.map(ct => ct.ma))
  const ctHienThi = CT_XA_HOI.filter(ct => maCTXuat.has(ct.ma))
  if (ctHienThi.length > 0) {
    charts.push({
      title: 'So Sánh Chỉ Tiêu Xã Hội Giữa Các Thôn',
      type: 'barStacked',
      categories: tenThon,
      series: ctHienThi.map(ct => ({
        name: ct.ten,
        values: duLieuThon.map(t => parseInt(t[ct.key]) || 0),
        color: ct.color,
      })),
      fromCol: 1, fromRow: row, toCol: 12, toRow: row + 18,
    })
    row += 20
  }

  // Chart 4: Horizontal bar — Tổng hợp chỉ tiêu toàn xã
  const duLieuCT = danhSachCTXuat
    .map(ct => ({
      ten: `${ct.ma} — ${ct.ten}`,
      giaTri: duLieuThon.reduce((s, t) => s + (parseInt(t[ct.key]) || 0), 0),
    }))
    .sort((a, b) => a.giaTri - b.giaTri)

  charts.push({
    title: 'Tổng Hợp Chỉ Tiêu Toàn Xã',
    type: 'barH',
    categories: duLieuCT.map(d => d.ten),
    series: [{ name: 'Giá trị', values: duLieuCT.map(d => d.giaTri), color: '#2563EB' }],
    fromCol: 1, fromRow: row, toCol: 12, toRow: row + Math.max(14, danhSachCTXuat.length + 4),
  })

  return charts
}
