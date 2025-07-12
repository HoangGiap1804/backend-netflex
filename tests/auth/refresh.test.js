// tests/auth/refreshToken.test.js
import request from 'supertest';
import app from '../../app.js';
import pool from '../../config/db.js';

describe('Auth API - Refresh Token', () => {
  const username = 'testrefreshuser_' + Date.now();
  const password = '123456';
  let refreshToken;

  beforeAll(async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username, password });

    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ username, password });

    refreshToken = res2.body.refreshToken;
  });

  it('should return new token with valid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should return 401 with invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalidtoken' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('msg');
  });

  it('should return 401 with refresh token is empty', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: '' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('msg');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE username = ?', [username]);
    await pool.end();
  });
});

