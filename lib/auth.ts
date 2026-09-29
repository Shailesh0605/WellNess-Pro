export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  const headers = new Headers(init?.headers || {})
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  const res = await fetch(input.toString().startsWith('http') ? input : `${API}${input}`, { ...init, headers, credentials: 'include' })
  if (res.status === 401) {
    // try refresh
    const r = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' })
    const data = await r.json()
    if (r.ok && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken)
      headers.set('Authorization', `Bearer ${data.accessToken}`)
      return fetch(input.toString().startsWith('http') ? input : `${API}${input}`, { ...init, headers, credentials: 'include' })
    }
  }
  return res
}
