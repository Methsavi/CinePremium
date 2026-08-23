import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';

describe('Integration Tests: Health & Base Routes', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start temporary test server instance
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET / should return 200 with welcome message and docs route', async () => {
    const res = await fetch(`${baseUrl}/`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.message, 'Welcome to Express Monolith API');
    assert.equal(data.docs, '/api/v1/health');
  });

  it('GET /api/v1/health should return 200 with UP status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.data);
    assert.equal(data.data.status, 'UP');
    assert.ok(data.data.timestamp);
  });

  it('GET /api/v1/non-existent-route should return 404 with error message', async () => {
    const res = await fetch(`${baseUrl}/api/v1/non-existent-route`);
    const data = await res.json();

    assert.equal(res.status, 404);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('not found'));
  });
});
