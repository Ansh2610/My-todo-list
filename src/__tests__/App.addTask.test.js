import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

// Mock API utils
jest.mock('../utils/api', () => {
  const mockApi = {
    get: jest.fn(async (url) => {
      console.log('Mock API GET called with:', url);
      if (url === '/auth/verify') {
        return { data: { user: { id: 'u1', username: 'Test', email: 't@t.com', avatar: 1 } } };
      }
      if (url === '/tasks') {
        return { data: [] };
      }
      return { data: [] };
    }),
    post: jest.fn(async (url, body) => {
      console.log('Mock API POST called with:', url, body);
      if (url === '/tasks') {
        return { data: { _id: 't1', title: body.title, description: '', priority: 'medium', category: 'personal', completed: false } };
      }
      return { data: {} };
    })
  };
  return { default: mockApi, __esModule: true };
});

jest.mock('js-cookie', () => ({ 
  get: jest.fn(() => 'mock-token'), 
  set: jest.fn(), 
  remove: jest.fn() 
}));

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

test('add a task and check it appears', async () => {
  renderWithAuth(<App />);

  // Wait for auth to be verified and user to be logged in
  await waitFor(() => {
    expect(screen.queryByText('PLAYER LOGIN')).not.toBeInTheDocument();
  });

  // Wait for the task form to appear
  const input = await screen.findByPlaceholderText(/enter quest name/i);
  fireEvent.change(input, { target: { value: 'New Task' } });

  const btn = screen.getByRole('button', { name: /create quest/i });
  fireEvent.click(btn);

  await waitFor(() => {
    expect(screen.getByText(/new task/i)).toBeInTheDocument();
  });
});
