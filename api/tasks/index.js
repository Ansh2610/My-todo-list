import connectDB from '../../lib/mongodb';
import Task from '../../lib/models/Task';
import { verifyToken, extractToken } from '../../lib/auth';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = extractToken(req);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const tasks = await Task.find({ userId: decoded.userId }).sort({ createdAt: -1 });
        return res.status(200).json(tasks);
      } catch (error) {
  return res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
      }

    case 'POST':
      try {
  const { title, description, priority, category, dueDate } = req.body || {};
  const data = { title, description, priority, category, userId: decoded.userId };
  if (dueDate) data.dueDate = new Date(dueDate);

  const task = await Task.create(data);
        return res.status(201).json(task);
      } catch (error) {
  return res.status(400).json({ error: 'Failed to create task', details: error.message });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}