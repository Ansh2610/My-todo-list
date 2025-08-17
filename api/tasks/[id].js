import connectDB from '../../lib/mongodb';
import Task from '../../lib/models/Task';
import { verifyToken, extractToken } from '../../lib/auth';

export default async function handler(req, res) {
  const token = extractToken(req);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const task = await Task.findOne({ _id: id, userId: decoded.userId });
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json(task);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch task' });
      }

    case 'PUT':
      try {
        const task = await Task.findOneAndUpdate(
          { _id: id, userId: decoded.userId },
          { ...req.body, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json(task);
      } catch (error) {
        return res.status(400).json({ error: 'Failed to update task' });
      }

    case 'DELETE':
      try {
        const task = await Task.findOneAndDelete({ _id: id, userId: decoded.userId });
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}