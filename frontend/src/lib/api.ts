const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// ===== Quan ly token (access 30p + refresh 7d) =====
const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (accessToken: string, refreshToken?: string) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    // Don token cu (phien ban truoc dung key 'token')
    localStorage.removeItem('token')
  },
}

// Bao boc goi refresh de nhieu request 401 cung luc chi refresh 1 lan
let dangRefresh: Promise<boolean> | null = null

async function lamMoiToken(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh()
  if (!refreshToken) return false
  if (dangRefresh) return dangRefresh

  dangRefresh = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      const json = await res.json()
      if (res.ok && json?.success && json.data?.accessToken) {
        tokenStore.set(json.data.accessToken, json.data.refreshToken)
        return true
      }
      tokenStore.clear()
      return false
    } catch {
      tokenStore.clear()
      return false
    } finally {
      dangRefresh = null
    }
  })()
  return dangRefresh
}

// Boc response: { success, data } -> data ; { success:false, error } -> throw
function boc(json: any, status: number) {
  if (json && typeof json === 'object' && 'success' in json) {
    if (json.success) return json.data
    // Loi envelope chuan. Giu ca `error` (chuoi message) de tuong thich code cu dung err.error
    const msg = json.error?.message || 'Da co loi xay ra'
    throw { status, code: json.error?.code, message: msg, error: msg, detail: json.error?.detail }
  }
  // Response cu khong boc envelope (phong ho)
  return json
}

async function goi<T>(endpoint: string, options: RequestInit, coFormData = false, thuLai = true): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (!coFormData) headers['Content-Type'] = 'application/json'
  const access = tokenStore.getAccess()
  if (access) headers['Authorization'] = `Bearer ${access}`

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })

  let json: any = null
  try { json = await res.json() } catch { /* file/empty */ }

  // Access token het han -> thu refresh 1 lan roi goi lai
  if (res.status === 401 && thuLai && json?.error?.code === 'TOKEN_EXPIRED') {
    const ok = await lamMoiToken()
    if (ok) return goi<T>(endpoint, options, coFormData, false)
  }

  if (!res.ok) {
    throw boc(json ?? { success: false, error: { message: 'Loi ket noi' } }, res.status)
  }
  return boc(json, res.status)
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return goi<T>(endpoint, options)
}

async function uploadRequest<T = any>(endpoint: string, formData: FormData): Promise<T> {
  return goi<T>(endpoint, { method: 'POST', body: formData }, true)
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  upload: <T = any>(endpoint: string, formData: FormData) => uploadRequest<T>(endpoint, formData),
}
