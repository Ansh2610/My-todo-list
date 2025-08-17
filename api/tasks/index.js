import connectDB from '../../lib/mongodb';
import Task from '../../lib/models/Task';
import { verifyToken, extractToken } from '../../lib/auth';

export default async function handler(req, res) {
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
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }

    case 'POST':
      try {
        const task = await Task.create({
          ...req.body,
          userId: decoded.userId
        });
        return res.status(201).json(task);
      } catch (error) {
        return res.status(400).json({ error: 'Failed to create task' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}