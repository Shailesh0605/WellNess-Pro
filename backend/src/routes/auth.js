const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_dev_secret';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  activityLevel: z.string().optional(),
  fitnessGoal: z.string().optional(),
  medicalConditions: z.string().optional(),
  dietaryPreferences: z.string().optional(),
  profilePhoto: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function createAccessToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
}

function createRefreshToken(user) {
  return jwt.sign({ userId: user.id, tokenVersion: user.tokenVersion || 0 }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

// signup
router.post('/signup', async (req, res) => {
  try {
    const parsed = signupSchema.parse(req.body);
    const hashed = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        password: hashed,
        name: parsed.name,
        age: parsed.age,
        gender: parsed.gender,
        height: parsed.height,
        weight: parsed.weight,
        activityLevel: parsed.activityLevel,
        fitnessGoal: parsed.fitnessGoal,
        medicalConditions: parsed.medicalConditions,
        dietaryPreferences: parsed.dietaryPreferences,
        profilePhoto: parsed.profilePhoto,
      },
    });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    // Prisma unique constraint error (duplicate email)
    if (err.code === 'P2002') {
      console.error('Prisma unique constraint error:', err.meta)
      return res.status(409).json({ error: 'email already exists' })
    }
    console.error(err);
    res.status(500).json({ error: 'could not create user' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    // check if account is temporarily locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({ error: 'account temporarily locked due to multiple failed login attempts' });
    }
    const ok = await bcrypt.compare(parsed.password, user.password);
    if (!ok) {
      // increment failed attempts and set lockout if threshold exceeded
      const attempts = (user.failedLoginAttempts || 0) + 1
      const updates = { failedLoginAttempts: attempts }
      const MAX_ATTEMPTS = 5
      if (attempts >= MAX_ATTEMPTS) {
        // lock for 15 minutes
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
        updates.failedLoginAttempts = 0
      }
      await prisma.user.update({ where: { id: user.id }, data: updates })
      return res.status(401).json({ error: 'invalid credentials' })
    }
    // successful login: reset failed attempts and update lastLogin
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLogin: new Date() } })
    const updatedUser = { ...user, failedLoginAttempts: 0 }
    const accessToken = createAccessToken(updatedUser);
    const refreshToken = createRefreshToken(user);
    // set HttpOnly cookie
    // in production make cookie secure: true and sameSite: 'lax'
    const cookieOptions = { httpOnly: true, path: '/auth/refresh' }
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true
      cookieOptions.sameSite = 'lax'
    }
    res.cookie('jid', refreshToken, cookieOptions);
    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: 'login failed' });
  }
});

// refresh token
router.post('/refresh', async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).json({ ok: false, accessToken: '' });
  let payload = null;
  try {
    payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).json({ ok: false, accessToken: '' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ ok: false, accessToken: '' });
    // optionally check tokenVersion here
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    res.cookie('jid', refreshToken, { httpOnly: true, path: '/auth/refresh' });
    return res.json({ ok: true, accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, accessToken: '' });
  }
});

// logout: clear cookie
router.post('/logout', async (req, res) => {
  try {
    // If the user is authenticated via cookie, try to increment tokenVersion to invalidate refresh tokens
    const token = req.cookies.jid
    if (token) {
      try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET)
        if (payload && payload.userId) {
          await prisma.user.update({ where: { id: payload.userId }, data: { tokenVersion: { increment: 1 } } })
        }
      } catch (e) {
        // ignore verification errors
      }
    }
    res.clearCookie('jid', { path: '/auth/refresh' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('logout error', err)
    return res.status(500).json({ ok: false })
  }
});

module.exports = router;
