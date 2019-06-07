/**
 * Tests for /src/app/index.js
 * @since 7/26/18
 * @file
 */

import app from '../index';

describe('/src/app/index', () => {
  it('Shoult export `app` which is a function', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.use).toBe('function');
  });
});
