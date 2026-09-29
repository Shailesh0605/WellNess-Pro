"use client"

import { useEffect, useState } from 'react'

type User = any
type Workout = any
type Session = any

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [uRes, wRes, sRes] = await Promise.all([
        fetch(`${API}/admin/users`),
        fetch(`${API}/admin/workouts`),
        fetch(`${API}/admin/sessions`),
      ])
      if (!uRes.ok) throw new Error('failed users')
      if (!wRes.ok) throw new Error('failed workouts')
      if (!sRes.ok) throw new Error('failed sessions')
      setUsers(await uRes.json())
      setWorkouts(await wRes.json())
      setSessions(await sRes.json())
    } catch (err: any) {
      console.error(err)
      setError(String(err.message || err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const seedWorkouts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/admin/seed-workouts`, { method: 'POST' })
      if (!res.ok) throw new Error('seed failed')
      await load()
    } catch (err: any) {
      setError(String(err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin - Database</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            onClick={seedWorkouts}
            className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
            disabled={loading}
          >
            Seed Workouts
          </button>
        </div>
      </div>

      {error && <div className="text-destructive mb-4">{error}</div>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Last Login</th>
                <th className="px-4 py-2">Token Ver.</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.name || '-'}</td>
                  <td className="px-4 py-2">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">{u.tokenVersion}</td>
                  <td className="px-4 py-2">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Workouts</h2>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-4 py-2">{w.id}</td>
                  <td className="px-4 py-2">{w.title}</td>
                  <td className="px-4 py-2">{w.notes || '-'}</td>
                  <td className="px-4 py-2">{w.user?.email || w.userId}</td>
                  <td className="px-4 py-2">{new Date(w.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Sessions</h2>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">IP</th>
                <th className="px-4 py-2">User Agent</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Expires</th>
                <th className="px-4 py-2">Revoked</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2">{s.user?.email || s.userId}</td>
                  <td className="px-4 py-2">{s.ip || '-'}</td>
                  <td className="px-4 py-2">{s.userAgent || '-'}</td>
                  <td className="px-4 py-2">{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">{s.isRevoked ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
