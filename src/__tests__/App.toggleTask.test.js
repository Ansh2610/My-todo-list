import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

jest.mock('../utils/api', () => {
  const get = jest.fn(async (url) => {
    if (url === '/auth/verify') return { data: { user: { id: 'u1', username: 'Test', email: 't@t.com', avatar: 1 } } };
    if (url === '/tasks') return { data: [{ _id: 't1', title: 'Test', completed: false, priority: 'medium', category: 'personal' }] };
    return { data: [] };
  });
  const patch = jest.fn(async () => ({ data: { _id: 't1', title: 'Test', completed: true, priority: 'medium', category: 'personal' } }));
  const post = jest.fn(async () => ({ data: { _id: 't2', title: 'New', completed: false, priority: 'medium', category: 'personal' } }));
  return { get, patch, post };
});

jest.mock('js-cookie', () => ({ get: () => 'token', set: jest.fn(), remove: jest.fn() }));

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

test('mark a task as complete updates status', async () => {
  renderWithAuth(<App />);

  const checkbox = await screen.findByLabelText('toggle');
  fireEvent.click(checkbox);

  await waitFor(() => {
    // The completed task uses checkmark on the button
    expect(checkbox).toHaveClass('checked');
  });
});
