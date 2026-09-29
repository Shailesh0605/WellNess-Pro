const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /custom-foods - list custom foods for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const foods = await prisma.customFood.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch custom foods' });
  }
});

// POST /custom-foods - create a new custom food for authenticated user
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, calories, protein, carbs, fat, type, emoji } = req.body;
    const created = await prisma.customFood.create({ data: { userId, name, calories: Number(calories) || 0, protein: Number(protein) || 0, carbs: Number(carbs) || 0, fat: Number(fat) || 0, type: type || 'Snack', emoji: emoji || null } });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create custom food' });
  }
});

// DELETE /custom-foods/:id - delete a custom food (only owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.customFood.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not found' });
    if (existing.userId !== userId) return res.status(403).json({ error: 'forbidden' });
    await prisma.customFood.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete custom food' });
  }
});

module.exports = router;
