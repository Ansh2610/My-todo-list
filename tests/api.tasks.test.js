const request = require('supertest');
const { app } = require('../api-server');

// These tests hit the local Express API defined in api-server.js (not serverless).
// The Express API uses in-memory storage if MongoDB is not connected.

describe('Tasks API (Express)', () => {
  it('POST /api/tasks creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test', priority: 'medium', category: 'personal' })
      .expect(201);

    expect(res.body.title).toBe('Test');
    expect(res.body._id).toBeDefined();
  });

  it('DELETE /api/tasks/:id deletes the task', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'To Delete' })
      .expect(201);

    await request(app)
      .delete(`/api/tasks/${create.body._id}`)
      .expect(204);
  });
});
