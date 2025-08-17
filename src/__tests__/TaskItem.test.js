import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../components/Tasks/TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test description',
    completed: false,
    priority: 'medium',
    category: 'personal',
    createdAt: new Date().toISOString()
  };

  test('toggles task completion when checkbox is clicked', () => {
    const mockOnToggle = jest.fn();
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    
    render(
      <TaskItem 
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Find the toggle checkbox by aria-label
    const toggleButton = screen.getByLabelText('toggle');
    
    // Click the toggle
    fireEvent.click(toggleButton);
    
    // Verify the callback was called with task id
    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  test('calls delete when delete button is clicked and confirmed', () => {
    const mockOnToggle = jest.fn();
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    
    render(
      <TaskItem 
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Find the delete button by aria-label
    const deleteButton = screen.getByLabelText('delete');
    
    // Click the delete button
    fireEvent.click(deleteButton);
    
    // The pixel confirm popup should appear - look for "YES" button
    const confirmButton = screen.getByText('YES');
    fireEvent.click(confirmButton);
    
    // Verify the callback was called with task id
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});
