import connectDB from '../../lib/mongodb';
import Task from '../../lib/models/Task';
import { verifyToken, extractToken } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.body;

  try {
    await connectDB();
    
    const task = await Task.findOne({ _id: id, userId: decoded.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    task.updatedAt = new Date();
    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle task' });
  }
}