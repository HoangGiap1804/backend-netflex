// tests/auth/login.test.js
import request from 'supertest';
import app from '../../app.js';
import pool from '../../config/db.js';

describe('Auth API - Login', () => {
  const baseUrl = '/api/auth/login';
  const username = 'testloginuser_' + Date.now();
  const password = '123456';

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username, password });
  });

  it('should return 200 and token when login successful', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ username, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should return 401 when password is incorrect', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ username, password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('msg');
  });

  it('should return 401 when username does not exist', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ username: 'unknownuser', password: '123456' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('msg');
  });

  it('should return 400 when username is empty', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ username: '', password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('msg');
  });

  it('should return 400 when password is empty', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ username: username, password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('msg');
  });
  
  it('should return 400 when username and password are empty', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ username: '', password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('msg');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE username = ?', [username]);
    await pool.end();
  });
});

