import React, { useState, useEffect } from 'react';
import './TaskForm.css';

function TaskForm({ onSubmit, initialData, isEditing, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    dueDate: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        category: initialData.category || 'personal',
        dueDate: initialData.dueDate ? 
          new Date(initialData.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('QUEST TITLE REQUIRED!');
      return;
    }

    const result = await onSubmit(formData);
    
    if (result.success) {
      if (!isEditing) {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          category: 'personal',
          dueDate: ''
        });
      }
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="task-form pixel-card" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {isEditing ? '⚙️ EDIT QUEST' : '➕ NEW QUEST'}
      </h2>
      
      {error && <div className="pixel-error">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label className="pixel-label">QUEST TITLE</label>
          <input
            type="text"
            name="title"
            className="pixel-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter quest name..."
            maxLength={100}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="pixel-label">DESCRIPTION</label>
          <textarea
            name="description"
            className="pixel-input pixel-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Quest details..."
            rows={3}
            maxLength={500}
          />
        </div>
      </div>

      <div className="form-row form-row-3">
        <div className="form-group">
          <label className="pixel-label">PRIORITY</label>
          <select
            name="priority"
            className="pixel-select"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">⬇️ LOW</option>
            <option value="medium">➡️ MEDIUM</option>
            <option value="high">⬆️ HIGH</option>
          </select>
        </div>

        <div className="form-group">
          <label className="pixel-label">CATEGORY</label>
          <select
            name="category"
            className="pixel-select"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="personal">👤 PERSONAL</option>
            <option value="work">💼 WORK</option>
            <option value="shopping">🛒 SHOPPING</option>
            <option value="health">❤️ HEALTH</option>
            <option value="other">📦 OTHER</option>
          </select>
        </div>

        <div className="form-group">
          <label className="pixel-label">DUE DATE</label>
          <input
            type="date"
            name="dueDate"
            className="pixel-input"
            value={formData.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="pixel-btn success">
          {isEditing ? 'UPDATE' : 'CREATE'} QUEST
        </button>
        {isEditing && (
          <button 
            type="button" 
            className="pixel-btn secondary"
            onClick={onCancel}
          >
            CANCEL
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;