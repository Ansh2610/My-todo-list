const request = require('supertest');
const { startServer } = require('../api-server');

let server;

beforeAll(async () => {
  server = await startServer();
});

afterAll(async () => {
  if (server && server.close) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// These tests hit the local Express API defined in api-server.js (not serverless).
// The Express API uses in-memory storage if MongoDB is not connected.

describe('Tasks API (Express)', () => {
  it('POST /api/tasks creates a task', async () => {
  const res = await request(server)
      .post('/api/tasks')
      .send({ title: 'Test', priority: 'medium', category: 'personal' })
      .expect(201);

    expect(res.body.title).toBe('Test');
    expect(res.body._id).toBeDefined();
  });

  it('DELETE /api/tasks/:id deletes the task', async () => {
  const create = await request(server)
      .post('/api/tasks')
      .send({ title: 'To Delete' })
      .expect(201);

  await request(server)
      .delete(`/api/tasks/${create.body._id}`)
      .expect(204);
  });
});
