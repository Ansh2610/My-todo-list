import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

// Mock API utils
jest.mock('../utils/api', () => {
  const get = jest.fn(async (url) => {
    if (url === '/auth/verify') {
      return { data: { user: { id: 'u1', username: 'Test', email: 't@t.com', avatar: 1 } } };
    }
    if (url === '/tasks') {
      return { data: [] };
    }
    return { data: [] };
  });
  const post = jest.fn(async (url, body) => {
    if (url === '/tasks') {
      return { data: { _id: 't1', title: body.title, description: '', priority: 'medium', category: 'personal', completed: false } };
    }
    return { data: {} };
  });
  return { get, post };
});

jest.mock('js-cookie', () => ({ get: () => 'token', set: jest.fn(), remove: jest.fn() }));

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

test('add a task and check it appears', async () => {
  renderWithAuth(<App />);

  // Fill the form
  const input = await screen.findByPlaceholderText(/enter quest name/i);
  fireEvent.change(input, { target: { value: 'New Task' } });

  const btn = screen.getByRole('button', { name: /create quest/i });
  fireEvent.click(btn);

  await waitFor(() => {
    expect(screen.getByText(/new task/i)).toBeInTheDocument();
  });
});
