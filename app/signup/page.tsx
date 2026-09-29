"use client"

import type { FormEvent } from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Dumbbell } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  name: string
  email: string
  age: string
  gender: string
  height: string
  weight: string
  activityLevel: string
  fitnessGoal: string
  medicalConditions: string
  dietaryPreferences: string
  profilePhoto: string
}

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  // Profile fields
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [activityLevel, setActivityLevel] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState("")
  const [medicalConditions, setMedicalConditions] = useState("")
  const [dietaryPreferences, setDietaryPreferences] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    // basic validations first
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (submitting) return
    setSubmitting(true)

    try {
      const API = (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:4000"
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          age: age ? parseInt(age, 10) : undefined,
          gender: gender || undefined,
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          activityLevel: activityLevel || undefined,
          fitnessGoal: fitnessGoal || undefined,
          medicalConditions: medicalConditions || undefined,
          dietaryPreferences: dietaryPreferences || undefined,
        }),
      })

      // Success: user created
      if (res.status === 201) {
        // redirect to login page and include a flag so login can show a success message
        router.push('/login?registered=1')
        return
      }

      // try to parse error body
      let data: any = null
      try { data = await res.json() } catch (e) { /* ignore */ }

      if (res.status === 409) {
        setError(data?.error || 'An account with this email already exists. Try logging in.')
        return
      }

      if (res.status === 400) {
        // show validation errors if provided by server
        const message = Array.isArray(data?.error) ? data.error.map((i:any)=>i.message).join('; ') : data?.error || 'Invalid input'
        setError(message)
        return
      }

      setError(data?.error || 'Signup failed')
    } catch (err) {
      console.error(err)
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
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

      <div className="glass-card rounded-3xl p-12 w-full max-w-2xl min-h-[80vh] flex flex-col justify-center relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-5">
            <Dumbbell className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground">Start Your Journey</h1>
          <p className="text-muted-foreground mt-2 font-semibold text-lg">Transform Your Life, One Day at a Time</p>
          <p className="text-muted-foreground text-sm mt-1">Create an account to begin your wellness transformation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/50"
            />
          </div>

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
                placeholder="Create a password"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2 animate-pulse">Age</label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              placeholder="Enter your age"
              min="1"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2 animate-pulse">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-700 mb-2 animate-pulse">Height (cm)</label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
              placeholder="Enter your height"
              min="50"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-700 mb-2 animate-pulse">Weight (kg)</label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
              placeholder="Enter your weight"
              min="20"
              max="500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-orange-700 mb-2 animate-pulse">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very-active">Very Active (intense exercise daily)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-orange-700 mb-2 animate-pulse">Fitness Goal</label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
            >
              <option value="">Select fitness goal</option>
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="endurance">Build Endurance</option>
              <option value="flexibility">Improve Flexibility</option>
              <option value="general-health">General Health</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-pink-700 mb-2 animate-pulse">
              Medical Conditions (if any)
            </label>
            <textarea
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300"
              placeholder="e.g., Diabetes, High blood pressure, Asthma, etc."
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-pink-700 mb-2 animate-pulse">
              Dietary Preferences
            </label>
            <textarea
              value={dietaryPreferences}
              onChange={(e) => setDietaryPreferences(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300"
              placeholder="e.g., Vegetarian, Vegan, Gluten-free, Allergies, etc."
              rows={3}
            />
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full hover-3d py-4 text-lg" disabled={submitting}>
            {submitting ? 'Signing up…' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
