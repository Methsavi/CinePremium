import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiResponse } from '../../src/utils/apiResponse.js';
import { ApiError } from '../../src/utils/apiError.js';

describe('Unit Tests: API Utilities', () => {
  it('ApiResponse should create a standard success response', () => {
    const data = { id: 'test-123', title: 'Inception' };
    const response = new ApiResponse(200, data, 'Movie fetched successfully');

    assert.equal(response.statusCode, 200);
    assert.equal(response.success, true);
    assert.equal(response.message, 'Movie fetched successfully');
    assert.deepEqual(response.data, data);
  });

  it('ApiResponse should set success to false for status codes >= 400', () => {
    const response = new ApiResponse(404, null, 'Not found');
    assert.equal(response.statusCode, 404);
    assert.equal(response.success, false);
  });

  it('ApiError should create standard error object with status code and error array', () => {
    const error = new ApiError(400, 'Invalid movie ID', ['ID must be a 24-character hex string']);

    assert.equal(error.statusCode, 400);
    assert.equal(error.success, false);
    assert.equal(error.message, 'Invalid movie ID');
    assert.equal(error.errors.length, 1);
    assert.equal(error.errors[0], 'ID must be a 24-character hex string');
  });

  it('ApiError should default to 500 status message when omitted', () => {
    const error = new ApiError(500);
    assert.equal(error.statusCode, 500);
    assert.equal(error.message, 'Something went wrong');
    assert.equal(error.success, false);
  });
});
