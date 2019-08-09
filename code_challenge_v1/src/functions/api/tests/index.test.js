/**
 * Tests for /src/functions/api/index.js
 * @since 7/26/18
 * @file
 */

import { app } from '../index';

describe('/src/functions/api/index', () => {
  it('exports `app` which is a function', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });
});
