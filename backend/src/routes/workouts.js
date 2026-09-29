const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  const userId = req.userId;
  const workouts = await prisma.workout.findMany({ where: { userId } });
  res.json(workouts);
});

router.post('/', auth, async (req, res) => {
  const userId = req.userId;
  const { title, notes, date } = req.body;
  const workout = await prisma.workout.create({ data: { title, notes, date: date ? new Date(date) : new Date(), userId } });
  res.status(201).json(workout);
});

module.exports = router;
