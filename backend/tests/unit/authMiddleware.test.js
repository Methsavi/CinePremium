import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { verifyJWT } from '../../src/middlewares/auth.middleware.js';
import { config } from '../../src/config/env.js';

describe('Unit Tests: Authentication Middleware', () => {
  it('should throw 401 when Authorization header is missing', async () => {
    const req = { headers: {} };
    const res = {};
    let errorCaught = null;
    const next = (err) => {
      if (err) errorCaught = err;
    };

    try {
      await verifyJWT(req, res, next);
    } catch (err) {
      errorCaught = err;
    }

    assert.ok(errorCaught, 'Expected error to be thrown or passed to next');
    assert.equal(errorCaught.statusCode, 401);
  });

  it('should throw 401 when Authorization format is not Bearer', async () => {
    const req = { headers: { authorization: 'Basic xyz123' } };
    const res = {};
    let errorCaught = null;
    const next = (err) => {
      if (err) errorCaught = err;
    };

    try {
      await verifyJWT(req, res, next);
    } catch (err) {
      errorCaught = err;
    }

    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 401);
  });

  it('should pass and attach decoded user when token is valid', async () => {
    const mockPayload = { id: 'user_12345', email: 'user@cinepremium.com', role: 'user' };
    const validToken = jwt.sign(mockPayload, config.jwtSecret || 'dev-jwt-secret-key-123456');

    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = {};
    let nextCalled = false;
    const next = (err) => {
      if (!err) nextCalled = true;
    };

    await verifyJWT(req, res, next);

    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.id, mockPayload.id);
    assert.equal(req.user.email, mockPayload.email);
    assert.equal(req.user.role, mockPayload.role);
  });
});
