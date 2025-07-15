const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const router = express.Router();

// Get todos
router.get('/', auth, async (req, res) => {
  const todos = await Todo.find({ user: req.user._id });
  res.json(todos);
});

// Add todo
router.post('/', auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: 'No text' });
  const todo = await Todo.create({ user: req.user._id, text });
  res.json(todo);
});

// Toggle done
router.patch('/:id', auth, async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
  if (!todo) return res.status(404).json({ msg: 'Not found' });
  todo.done = !todo.done;
  await todo.save();
  res.json(todo);
});

// Delete todo
router.delete('/:id', auth, async (req, res) => {
  await Todo.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ msg: 'Deleted' });
});

module.exports = router;