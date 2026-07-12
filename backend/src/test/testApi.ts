// Test toan bo API theo 3 role (dan/thon/xa) + kiem tra phan quyen 403 + auto-refresh
// Chay: npm run test:api  (backend phai dang chay o cong 3636)
import 'dotenv/config'

const BASE = process.env.TEST_BASE || 'http://localhost:3636/api/v1'

let passed = 0
let failed = 0
const fails: string[] = []

async function req(method: string, path: string, opts: { token?: string; body?: any } = {}) {
  const headers: any = { 'Content-Type': 'application/json' }
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  let data: any = null
  try { data = await res.json() } catch { /* file/empty */ }
  return { status: res.status, data }
}

function check(name: string, cond: boolean, extra = '') {
  if (cond) {
    passed++
    console.log(`  \x1b[32mPASS\x1b[0m ${name}`)
  } else {
    failed++
    fails.push(name + (extra ? ` (${extra})` : ''))
    console.log(`  \x1b[31mFAIL\x1b[0m ${name} ${extra}`)
  }
}

async function loginCanBo(tenDN: string, mk: string) {
  const r = await req('POST', '/auth/can-bo', { body: { ten_dang_nhap: tenDN, mat_khau: mk } })
  return r.data?.data
}

async function main() {
  console.log('\n===== TEST API 3 ROLE =====\n')

  // ---------- AUTH ----------
  console.log('[AUTH]')
  const xa = await loginCanBo('canboxa', 'demo123')
  check('Login xa tra accessToken+refreshToken', !!xa?.accessToken && !!xa?.refreshToken)
  check('Login xa vai_tro=xa', xa?.user?.vai_tro === 'xa')

  const thon1 = await loginCanBo('canbothon1', 'demo123')
  check('Login thon1 OK', !!thon1?.accessToken)
  const thon2 = await loginCanBo('canbothon2', 'demo124')
  check('Login thon2 (mat khau rieng demo124) OK', !!thon2?.accessToken)

  const saiMk = await req('POST', '/auth/can-bo', { body: { ten_dang_nhap: 'canboxa', mat_khau: 'sai' } })
  check('Login sai mat khau -> 401', saiMk.status === 401)

  // Dan login
  const danXm = await req('POST', '/auth/dan/xac-minh', { body: { cccd: '048025000001', ho_ten: 'Le Van An' } })
  check('Dan xac-minh -> user_id + sdt_masked', !!danXm.data?.data?.user_id && danXm.data?.data?.sdt_masked?.includes('*'))
  const danLogin = await req('POST', '/auth/dan/mat-khau', { body: { cccd: '048025000001', mat_khau: 'danmat1' } })
  const dan = danLogin.data?.data
  check('Dan login mat khau -> token', !!dan?.accessToken)
  check('Dan vai_tro=dan', dan?.user?.vai_tro === 'dan')

  // /me
  const me = await req('GET', '/auth/me', { token: xa.accessToken })
  check('/me voi access token OK', me.status === 200 && me.data?.data?.user?.vai_tro === 'xa')
  const meNoToken = await req('GET', '/auth/me')
  check('/me khong token -> 401', meNoToken.status === 401)

  // ---------- REFRESH ----------
  console.log('\n[REFRESH TOKEN]')
  const refreshed = await req('POST', '/auth/refresh', { body: { refreshToken: xa.refreshToken } })
  check('Refresh -> cap token moi', refreshed.status === 200 && !!refreshed.data?.data?.accessToken)
  const newRefresh = refreshed.data?.data?.refreshToken
  const reuseOld = await req('POST', '/auth/refresh', { body: { refreshToken: xa.refreshToken } })
  check('Refresh token cu bi thu hoi -> 401', reuseOld.status === 401)
  const logout = await req('POST', '/auth/logout', { body: { refreshToken: newRefresh } })
  check('Logout OK', logout.status === 200)
  const afterLogout = await req('POST', '/auth/refresh', { body: { refreshToken: newRefresh } })
  check('Refresh sau logout -> 401', afterLogout.status === 401)

  // Lay token moi cho cac test sau (da logout token cu)
  const xa2 = await loginCanBo('canboxa', 'demo123')
  const xaTok = xa2.accessToken

  // ---------- PERIODS ----------
  console.log('\n[PERIODS]')
  const periods = await req('GET', '/periods', { token: xaTok })
  check('GET periods (envelope success)', periods.data?.success === true && Array.isArray(periods.data?.data))
  const dotDangMo = periods.data.data.find((p: any) => p.trang_thai === 'dang_mo')
  check('Co dot dang mo', !!dotDangMo)
  const dotId = dotDangMo?.id || periods.data.data[0]?.id

  const createPeriodThon = await req('POST', '/periods', { token: thon1.accessToken, body: { ten_dot: 'x', loai: 'dot_xuat', nam: 2026, ngay_bat_dau: '2026-01-01', ngay_ket_thuc: '2026-01-02' } })
  check('Thon tao dot -> 403', createPeriodThon.status === 403)
  const createPeriodBad = await req('POST', '/periods', { token: xaTok, body: {} })
  check('Xa tao dot thieu field -> 422', createPeriodBad.status === 422)

  // ---------- REPORTS ----------
  console.log('\n[REPORTS]')
  const tienDo = await req('GET', `/reports/tien-do/${dotId}`, { token: xaTok })
  check('GET reports/tien-do', tienDo.data?.success === true)
  const tongHop = await req('GET', `/reports/tong-hop/${dotId}`, { token: xaTok })
  check('GET reports/tong-hop', tongHop.data?.success === true)

  // ---------- HOUSEHOLDS ----------
  console.log('\n[HOUSEHOLDS]')
  const hhAll = await req('GET', '/households', { token: xaTok })
  check('GET households (xa) - list', hhAll.data?.success === true && hhAll.data.data.length > 0)
  const hhMe = await req('GET', '/households/me', { token: dan.accessToken })
  check('GET households/me (dan)', hhMe.data?.success === true && !!hhMe.data.data)

  // ---------- NHAN KHAU (quan ly - chi xa) ----------
  console.log('\n[NHAN KHAU - Quan ly nhan khau]')
  const nkList = await req('GET', '/nhan-khau', { token: xaTok })
  check('GET nhan-khau (xa) - List view', nkList.data?.success === true && nkList.data.data.length > 0)
  check('List view KHONG lo CCCD that (chi che)', nkList.data.data[0]?.cccd === undefined)
  const nkThon = await req('GET', '/nhan-khau', { token: thon1.accessToken })
  check('Thon goi nhan-khau -> 403', nkThon.status === 403)
  const nkDan = await req('GET', '/nhan-khau', { token: dan.accessToken })
  check('Dan goi nhan-khau -> 403', nkDan.status === 403)

  const hoId = nkList.data.data[0]?.id
  const nkDetail = await req('GET', `/nhan-khau/${hoId}`, { token: xaTok })
  check('GET nhan-khau/:id Detail - lo CCCD day du', nkDetail.data?.success === true && /^\d{12}$/.test(nkDetail.data.data?.cccd || ''))
  const nkLog = await req('GET', `/nhan-khau/${hoId}/lich-su-truy-cap`, { token: xaTok })
  check('Detail da ghi log truy cap', nkLog.data?.success === true && nkLog.data.data.length > 0)

  // Them ho chuyen den + danh dau roi di
  const cccdTest = '077077' + String(Date.now()).slice(-6)
  const addHo = await req('POST', '/nhan-khau', { token: xaTok, body: { ho_ten: 'Test Chuyen Den', cccd: cccdTest, so_dien_thoai: '0988888888', thon_id: 1, dia_chi: 'Test' } })
  check('Them ho chuyen den -> 201', addHo.status === 201 && addHo.data?.data?.cccd === cccdTest)
  const newHoId = addHo.data?.data?.id
  const addDup = await req('POST', '/nhan-khau', { token: xaTok, body: { ho_ten: 'Test', cccd: cccdTest, so_dien_thoai: '0988888888', thon_id: 1 } })
  check('Them trung CCCD -> 409', addDup.status === 409)
  const roiDi = await req('PATCH', `/nhan-khau/${newHoId}/roi-di`, { token: xaTok, body: { ly_do: 'Test' } })
  check('Danh dau roi di OK', roiDi.status === 200)
  const loginRoi = await req('POST', '/auth/dan/xac-minh', { body: { cccd: cccdTest, ho_ten: 'Test Chuyen Den' } })
  check('Ho da roi KHONG dang nhap duoc -> 403', loginRoi.status === 403)

  // Cleanup ho test
  await cleanup(cccdTest)

  // ---------- DECLARATIONS ----------
  console.log('\n[DECLARATIONS]')
  const decMe = await req('GET', '/declarations/me', { token: dan.accessToken })
  check('GET declarations/me (dan)', decMe.data?.success === true)
  const decCreate = await req('POST', '/declarations', { token: xaTok, body: {} })
  check('Xa tao declaration -> 403 (chi dan)', decCreate.status === 403)
  const decBad = await req('POST', '/declarations', { token: dan.accessToken, body: { ct02_tong_nhan_khau: 0 } })
  check('Dan ke khai CT02=0 -> 422', decBad.status === 422)

  // ---------- VILLAGE DECLARATIONS ----------
  console.log('\n[VILLAGE DECLARATIONS]')
  const vd = await req('GET', `/village-declarations?dot_id=${dotId}`, { token: xaTok })
  check('GET village-declarations', vd.data?.success === true)
  const vdDan = await req('POST', '/village-declarations', { token: dan.accessToken, body: {} })
  check('Dan nhap ke khai thon -> 403', vdDan.status === 403)

  // ---------- NOTIFICATIONS ----------
  console.log('\n[NOTIFICATIONS]')
  const noti = await req('GET', '/notifications', { token: dan.accessToken })
  check('GET notifications', noti.data?.success === true)
  const notiCount = await req('GET', '/notifications/chua-doc', { token: dan.accessToken })
  check('GET notifications/chua-doc', notiCount.data?.success === true && typeof notiCount.data.data?.so_chua_doc === 'number')

  // ---------- USERS ----------
  console.log('\n[USERS]')
  const users = await req('GET', '/users?vai_tro=thon', { token: xaTok })
  check('GET users (xa)', users.data?.success === true)
  const usersThonList = await req('GET', '/users/thon', { token: xaTok })
  check('GET users/thon (danh sach thon)', usersThonList.data?.success === true && usersThonList.data.data.length === 10)

  // ---------- SUMMARY ----------
  console.log(`\n===== KET QUA: ${passed} PASS, ${failed} FAIL =====`)
  if (failed > 0) {
    console.log('\nCac test that bai:')
    fails.forEach(f => console.log('  - ' + f))
    process.exit(1)
  }
  process.exit(0)
}

async function cleanup(cccd: string) {
  const pg = (await import('pg')).default
  const pool = new pg.Pool({ connectionString: process.env.DB_CONNECTION_STRING, ssl: { rejectUnauthorized: false } })
  try {
    const ho = await pool.query('SELECT hd.id, hd.chu_ho_id FROM ho_dan hd JOIN nguoi_dung nd ON hd.chu_ho_id=nd.id WHERE nd.cccd=$1', [cccd])
    for (const r of ho.rows) {
      await pool.query('DELETE FROM nhat_ky WHERE bang_lien_quan=$1 AND ban_ghi_id=$2', ['ho_dan', r.id])
      await pool.query('DELETE FROM nhat_ky_truy_cap WHERE bang_lien_quan=$1 AND ban_ghi_id=$2', ['ho_dan', r.id])
      await pool.query('DELETE FROM ho_dan WHERE id=$1', [r.id])
      await pool.query('DELETE FROM refresh_token WHERE nguoi_dung_id=$1', [r.chu_ho_id])
      await pool.query('DELETE FROM nguoi_dung WHERE id=$1', [r.chu_ho_id])
    }
  } finally { await pool.end() }
}

main().catch(e => { console.error(e); process.exit(1) })
