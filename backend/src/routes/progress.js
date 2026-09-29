const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all workout logs for the authenticated user, ordered by timestamp desc
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const logs = await prisma.workoutLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch logs' });
  }
});

// Create a new workout log for the authenticated user
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { data, timestamp } = req.body;
    const log = await prisma.workoutLog.create({ data: { userId, data: data || {}, timestamp: timestamp ? new Date(timestamp) : new Date() } });
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create log' });
  }
});

// delete a log (optional)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.workoutLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ error: 'not found' });
    await prisma.workoutLog.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete' });
  }
});

module.exports = router;
