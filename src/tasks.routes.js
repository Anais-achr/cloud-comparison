const { Router } = require('express');
const tasks = require('./tasks.repository');

// Enveloppe les handlers async : toute erreur part vers le middleware
// d'erreur central, ce qui evite de repeter un try/catch dans chaque route.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();

// LIST
router.get('/', asyncHandler(async (req, res) => {
  res.json(await tasks.findAll());
}));

// READ one
router.get('/:id', asyncHandler(async (req, res) => {
  const task = await tasks.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  res.json(task);
}));

// CREATE
router.post('/', asyncHandler(async (req, res) => {
  const { title, done } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  res.status(201).json(await tasks.create({ title, done }));
}));

// UPDATE
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, done } = req.body ?? {};
  const task = await tasks.update(req.params.id, { title, done });
  if (!task) return res.status(404).json({ error: 'not found' });
  res.json(task);
}));

// DELETE
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await tasks.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
}));

module.exports = router;
