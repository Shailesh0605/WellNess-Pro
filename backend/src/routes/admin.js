const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// simple admin protection: require ADMIN_KEY header in prod, allow in dev
function requireAdmin(req, res, next) {
  const ADMIN_KEY = process.env.ADMIN_KEY
  if (process.env.NODE_ENV === 'production') {
    const key = req.get('x-admin-key')
    if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' })
  }
  // in dev allow if no ADMIN_KEY set
  return next()
}

router.use(requireAdmin)

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true, lastLogin: true, tokenVersion: true } })
    res.json(users)
  } catch (err) {
    console.error('admin/users', err)
    res.status(500).json({ error: 'failed' })
  }
})

router.get('/workouts', async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({ include: { user: { select: { id: true, email: true } } } })
    res.json(workouts)
  } catch (err) {
    console.error('admin/workouts', err)
    res.status(500).json({ error: 'failed' })
  }
})

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({ include: { user: { select: { id: true, email: true } } } })
    res.json(sessions)
  } catch (err) {
    console.error('admin/sessions', err)
    res.status(500).json({ error: 'failed' })
  }
})

// Seed sample workouts for demo: creates 3 workouts for the first user (dev only)
router.post('/seed-workouts', async (req, res) => {
  try {
    const user = await prisma.user.findFirst()
    if (!user) return res.status(400).json({ error: 'no users to seed' })
    const samples = [
      { title: 'Full Body Strength', notes: '3 sets x 8-12 reps', date: new Date(), userId: user.id },
      { title: 'HIIT Cardio', notes: '20 minutes intense intervals', date: new Date(), userId: user.id },
      { title: 'Yoga Recovery', notes: '30 minutes mobility and stretch', date: new Date(), userId: user.id },
    ]
    const created = []
    for (const s of samples) {
      const w = await prisma.workout.create({ data: s })
      created.push(w)
    }
    res.json({ ok: true, created })
  } catch (err) {
    console.error('admin/seed-workouts', err)
    res.status(500).json({ error: 'failed' })
  }
})

module.exports = router
