"use client"

import type React from "react"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Dumbbell } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const registered = searchParams?.get('registered') === '1'

  useEffect(() => {
    if (!registered) return
    // clear the flag from the URL after a short delay so the banner goes away
    const t = setTimeout(() => {
      try { router.replace('/login') } catch (e) { /* ignore */ }
    }, 3500)
    return () => clearTimeout(t)
  }, [registered, router])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!password) {
      setError("Please enter your password")
      return
    }

    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const API = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:4000'
        const url = `${API}/auth/login`
        console.debug('[login] POST ->', url)
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        })
        // try to parse JSON safely
        let data: any = null
        try { data = await res.json() } catch (e) { /* ignore parse errors */ }

        if (!res.ok) {
          // show server-provided message when available
          const serverErr = data?.error || data?.message || `${res.status} ${res.statusText}`
          setError(String(serverErr) || 'Login failed')
          return
        }

        // API returns { accessToken } and sets HttpOnly refresh cookie
        const { accessToken, user } = data || {}
        if (accessToken) {
          // store access token in localStorage for simplicity
          try {
            localStorage.setItem('accessToken', accessToken)
            if (user) localStorage.setItem('fitnessUser', JSON.stringify(user))
          } catch (e) { /* ignore */ }
          router.push('/dashboard')
        } else {
          setError('Login failed: no token')
        }
      } catch (err: any) {
        console.error('[login] fetch error:', err)
        // include the error message from the thrown error when possible
        setError(err?.message ? `Network error: ${err.message}` : 'Network error')
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating fitness illustrations */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="floating absolute top-20 left-10">
          <Dumbbell className="w-24 h-24 text-white" />
        </div>
        <div className="floating absolute bottom-20 right-10" style={{ animationDelay: "2s" }}>
          <Dumbbell className="w-32 h-32 text-white" />
        </div>
        <div className="floating absolute top-1/2 right-1/4" style={{ animationDelay: "4s" }}>
          <Dumbbell className="w-20 h-20 text-white" />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 font-semibold">Transform Your Life, One Day at a Time</p>
          <p className="text-muted-foreground text-sm mt-1">Log in to continue your wellness journey</p>
        </div>

        {registered && (
          <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 border border-green-100 text-sm">
            Account created successfully — please log in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

          <Button
            type="submit"
            className="w-full hover-3d bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold shadow-lg"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
