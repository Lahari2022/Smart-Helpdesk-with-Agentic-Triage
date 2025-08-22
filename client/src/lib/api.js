const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export async function api(path, { method='GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'Request failed'}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}
