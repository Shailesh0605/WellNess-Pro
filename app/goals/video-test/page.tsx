'use client'

import React, { useEffect, useState } from 'react'

type Workout = {
  day: number
  workout: string
  video?: string | null
}

const workoutsSeed: Omit<Workout, 'video'>[] = [
  { day: 1, workout: 'Strength Training (Chest & Triceps)' },
  { day: 2, workout: 'Strength Training (Back & Biceps)' },
  { day: 3, workout: '20 min Light Cardio + Stretching' },
  { day: 4, workout: 'Strength Training (Legs & Glutes)' },
  { day: 5, workout: 'Strength Training (Shoulders & Core)' },
  { day: 6, workout: 'Full Body Compound Exercises' },
  { day: 7, workout: 'Rest or Light Yoga' },
]

async function fetchVideoFor(workoutName: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/youtube/videos?query=${encodeURIComponent(workoutName)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data && data[0] && data[0].url ? data[0].url : null
  } catch (err) {
    console.error('fetchVideoFor error', err)
    return null
  }
}

export default function VideoTestPage() {
  const [plan, setPlan] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      const results = await Promise.all(
        workoutsSeed.map(async (w) => {
          const video = await fetchVideoFor(w.workout)
          return { ...w, video }
        })
      )

      if (mounted) {
        setPlan(results)
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Video fetch test (auto)</h2>
      <p className="mb-4">This page fetches a top YouTube result for each workout via <code>/api/youtube/videos</code>.</p>
      {loading ? (
        <p>Loading videos…</p>
      ) : (
        <ul className="space-y-3">
          {plan.map((item) => (
            <li key={item.day} className="p-3 border rounded">
              <div className="font-medium">Day {item.day}: {item.workout}</div>
              {item.video ? (
                <a href={item.video} target="_blank" rel="noopener noreferrer" className="text-blue-600">Open video</a>
              ) : (
                <div className="text-sm text-gray-500">No video found</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
