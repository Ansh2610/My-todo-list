import React from 'react';
import './TaskList.css';

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return '⬆️';
      case 'low': return '⬇️';
      default: return '➡️';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'work': return '💼';
      case 'shopping': return '🛒';
      case 'health': return '❤️';
      case 'personal': return '👤';
      default: return '📦';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className={`task-item pixel-card ${task.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
      <div className="task-header">
        <button 
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={() => onToggle(task._id)}
        >
          {task.completed && '✓'}
        </button>
        
        <div className="task-info">
          <h3 className="task-title">{task.title}</h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
        </div>
      </div>

      <div className="task-meta">
        <span className={`priority-badge priority-${task.priority}`}>
          {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
        </span>
        
        <span className="category-badge">
          {getCategoryIcon(task.category)} {task.category.toUpperCase()}
        </span>
        
        {task.dueDate && (
          <span className={`due-date ${isOverdue() ? 'overdue' : ''}`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      <div className="task-actions">
        <button 
          className="action-btn edit"
          onClick={() => onEdit(task)}
          title="Edit Quest"
        >
          ✏️
        </button>
        <button 
          className="action-btn delete"
          onClick={() => {
            if (window.confirm('DELETE THIS QUEST?')) {
              onDelete(task._id);
            }
          }}
          title="Delete Quest"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TaskItem;