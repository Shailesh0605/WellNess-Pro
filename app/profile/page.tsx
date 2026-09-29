"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Save, User } from "lucide-react"

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    fitnessGoal: "",
    medicalConditions: "",
    dietaryPreferences: "",
    profilePhoto: "",
  })
  const [previewPhoto, setPreviewPhoto] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    // Try to fetch the profile from backend. Fall back to localStorage if no token.
    ;(async () => {
      try {
        const API = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:4000'
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          // fallback to localStorage-stored user (older behaviour)
          const userData = localStorage.getItem('fitnessUser')
          if (userData) {
            const user = JSON.parse(userData)
            setProfile({
              name: user.name || "",
              email: user.email || "",
              age: user.age || "",
              gender: user.gender || "",
              height: user.height || "",
              weight: user.weight || "",
              activityLevel: user.activityLevel || "",
              fitnessGoal: user.fitnessGoal || "",
              medicalConditions: user.medicalConditions || "",
              dietaryPreferences: user.dietaryPreferences || "",
              profilePhoto: user.profilePhoto || "",
            })
            setPreviewPhoto(user.profilePhoto || "")
          }
          return
        }

        const res = await fetch(`${API}/user/profile`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        })
        if (!res.ok) {
          // if unauthorized or failed, fallback to localStorage
          const userData = localStorage.getItem('fitnessUser')
          if (userData) {
            const user = JSON.parse(userData)
            setProfile({
              name: user.name || "",
              email: user.email || "",
              age: user.age || "",
              gender: user.gender || "",
              height: user.height || "",
              weight: user.weight || "",
              activityLevel: user.activityLevel || "",
              fitnessGoal: user.fitnessGoal || "",
              medicalConditions: user.medicalConditions || "",
              dietaryPreferences: user.dietaryPreferences || "",
              profilePhoto: user.profilePhoto || "",
            })
            setPreviewPhoto(user.profilePhoto || "")
          }
          return
        }

        const user = await res.json()
        setProfile({
          name: user.name || "",
          email: user.email || "",
          age: user.age || "",
          gender: user.gender || "",
          height: user.height || "",
          weight: user.weight || "",
          activityLevel: user.activityLevel || "",
          fitnessGoal: user.fitnessGoal || "",
          medicalConditions: user.medicalConditions || "",
          dietaryPreferences: user.dietaryPreferences || "",
          profilePhoto: user.profilePhoto || "",
        })
        setPreviewPhoto(user.profilePhoto || "")
        // persist locally as well for offline convenience
        localStorage.setItem('fitnessUser', JSON.stringify(user))
      } catch (err) {
        console.error('Could not load profile', err)
      }
    })()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewPhoto(result)
        setProfile({ ...profile, profilePhoto: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    ;(async () => {
      try {
        const API = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:4000'
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          // offline/local fallback
          const userData = localStorage.getItem('fitnessUser')
          const user = userData ? JSON.parse(userData) : {}
          const updatedUser = { ...user, ...profile }
          localStorage.setItem('fitnessUser', JSON.stringify(updatedUser))
          alert('Profile updated locally')
          return
        }

        const res = await fetch(`${API}/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            name: profile.name,
            age: profile.age ? parseInt(profile.age as unknown as string, 10) : undefined,
            gender: profile.gender,
            height: profile.height ? parseFloat(profile.height as unknown as string) : undefined,
            weight: profile.weight ? parseFloat(profile.weight as unknown as string) : undefined,
            activityLevel: profile.activityLevel,
            fitnessGoal: profile.fitnessGoal,
            medicalConditions: profile.medicalConditions,
            dietaryPreferences: profile.dietaryPreferences,
            profilePhoto: profile.profilePhoto,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          alert('Failed to update profile: ' + (err.error || res.statusText))
          return
        }
        const updated = await res.json()
        localStorage.setItem('fitnessUser', JSON.stringify(updated))
        setPreviewPhoto(updated.profilePhoto || '')
        alert('Profile updated successfully!')
      } catch (err) {
        console.error(err)
        alert('Network error while updating profile')
      }
    })()
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-green-50 to-blue-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-gradient">
              Your Profile
            </h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>

          <Card className="p-8 backdrop-blur-sm bg-white/80 border-2 border-purple-200 shadow-xl">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">Click the camera icon to change photo</p>
            </div>

            {/* Profile Form */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-2 animate-pulse">Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-2 animate-pulse">Email *</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                  placeholder="Your email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2 animate-pulse">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2 animate-pulse">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
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
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
                  placeholder="Enter your height"
                  min="50"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cyan-700 mb-2 animate-pulse">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
                  placeholder="Enter your weight"
                  min="20"
                  max="500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-700 mb-2 animate-pulse">Activity Level</label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
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
                  value={profile.fitnessGoal}
                  onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
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
                  value={profile.medicalConditions}
                  onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
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
                  value={profile.dietaryPreferences}
                  onChange={(e) => setProfile({ ...profile, dietaryPreferences: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300"
                  placeholder="e.g., Vegetarian, Vegan, Gluten-free, Allergies, etc."
                  rows={3}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleSave}
                className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
