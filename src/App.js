import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Layout/Header';
import TaskForm from './components/Tasks/TaskForm';
import TaskList from './components/Tasks/TaskList';
import PixelLoader from './components/Layout/PixelLoader';
import api from './utils/api';
import './App.css';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks([response.data, ...tasks]);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to add task' };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      setTasks(tasks.map(task => task._id === id ? response.data : task));
      setEditingTask(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update task' };
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await api.patch('/tasks/toggle', { id });
      setTasks(tasks.map(task => task._id === id ? response.data : task));
    } catch (err) {
      console.error('Failed to toggle task');
    }
  };

  const deleteTask = async (id) => {
    try {
      console.log('Attempting to delete task:', id);
      const response = await api.delete(`/tasks/${id}`);
      console.log('Delete response:', response);
      setTasks(tasks.filter(task => task._id !== id));
      console.log('Task removed from state');
    } catch (err) {
      console.error('Failed to delete task:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  if (authLoading) {
    return <PixelLoader />;
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="pixel-stars"></div>
        <div className="auth-wrapper">
          <h1 className="pixel-title">
            <span className="pixel-icon">🎮</span> PIXEL TODO
          </h1>
          {showRegister ? (
            <Register onSwitch={() => setShowRegister(false)} />
          ) : (
            <Login onSwitch={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="App">
      <div className="pixel-stars"></div>
      <Header />
      
      <main className="main-content">
        <div className="container">
          <TaskForm
            onSubmit={editingTask ? 
              (data) => updateTask(editingTask._id, data) : 
              addTask
            }
            initialData={editingTask}
            isEditing={!!editingTask}
            onCancel={() => setEditingTask(null)}
          />

          <div className="filter-bar">
            <button 
              className={`pixel-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ALL [{tasks.length}]
            </button>
            <button 
              className={`pixel-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              ACTIVE [{tasks.filter(t => !t.completed).length}]
            </button>
            <button 
              className={`pixel-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              DONE [{tasks.filter(t => t.completed).length}]
            </button>
          </div>

          {loading && <PixelLoader />}
          {error && <div className="pixel-error">{error}</div>}
          
          {!loading && !error && (
            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={setEditingTask}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;