const API_BASE = '/v1'

function getHeaders() {
  const token = localStorage.getItem('ozyshield_token') || 'demo-token-123'
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export const api = {
  async get(path) {
    const r = await fetch(`${API_BASE}${path}`, { headers: getHeaders() })
    if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`)
    return r.json()
  },

  async post(path, body) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!r.ok) throw new Error(`POST ${path} failed: ${r.status}`)
    return r.json()
  },

  async put(path, body) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!r.ok) throw new Error(`PUT ${path} failed: ${r.status}`)
    return r.json()
  },

  async del(path) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!r.ok) throw new Error(`DELETE ${path} failed: ${r.status}`)
    return r.json()
  },
}
