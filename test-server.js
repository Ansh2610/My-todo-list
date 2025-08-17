const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for tests
let tasks = [];
let taskId = 1;

// Routes
app.post('/api/tasks', (req, res) => {
  const { title, priority = 'medium', category = 'personal' } = req.body;
  const task = {
    _id: taskId++,
    title,
    priority,
    category,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t._id == id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

const startServer = async () => {
  return app.listen(3001);
};

module.exports = { app, startServer };
