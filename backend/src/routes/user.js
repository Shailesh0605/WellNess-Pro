const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

const updateProfileSchema = z.object({
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

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const parsed = updateProfileSchema.parse(req.body);
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: parsed,
    });
    res.json(updatedUser);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: 'could not update user profile' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not fetch user profile' });
  }
});

module.exports = router;
