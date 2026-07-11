const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await res.json()
  if (!res.ok) {
    throw { status: res.status, ...data }
  }
  return data
}

async function uploadRequest(endpoint, formData) {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) {
    throw { status: res.status, ...data }
  }
  return data
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint, formData) => uploadRequest(endpoint, formData),
}
