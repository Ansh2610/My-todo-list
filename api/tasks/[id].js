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
        return res.status(500).json({ error: 'Failed to fetch task', details: error.message });
      }

    case 'PUT':
      try {
        const { title, description, priority, category, dueDate } = req.body || {};
        const update = { title, description, priority, category, updatedAt: new Date() };
        // Only include dueDate if provided and non-empty; if empty string, unset it
        if (dueDate === '') {
          update.$unset = { dueDate: 1 };
        } else if (dueDate) {
          update.dueDate = dueDate;
        }

        const task = await Task.findOneAndUpdate(
          { _id: id, userId: decoded.userId },
          update,
          { new: true, runValidators: true }
        );
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json(task);
      } catch (error) {
        return res.status(400).json({ error: 'Failed to update task', details: error.message });
      }

    case 'DELETE':
      try {
        const task = await Task.findOneAndDelete({ _id: id, userId: decoded.userId });
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete task', details: error.message });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}