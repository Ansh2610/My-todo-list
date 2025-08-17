import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../components/Tasks/TaskForm';

describe('TaskForm Component', () => {
  test('allows user to enter task title and submit', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue({ success: true });
    
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    // Find the input field
    const titleInput = screen.getByPlaceholderText(/enter quest name/i);
    
    // Type in the input
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    
    // Find and click the submit button
    const submitButton = screen.getByRole('button', { name: /create quest/i });
    fireEvent.click(submitButton);
    
    // Verify the callback was called
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Task'
      })
    );
  });
});
