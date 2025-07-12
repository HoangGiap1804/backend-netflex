// tests/auth.test.js
import request from 'supertest';
import app from '../app.js';
import pool from '../config/db.js'; 

describe('Auth API - Register', () => {
  const baseUrl = '/api/auth/register';

  it('should return 201 when register is successful', async () => {
    const username = 'testuser_' + Date.now();
    const res = await request(app)
      .post(baseUrl)
      .send({ username, password: '123456' });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('username', username);
  });

  it('should return 400 when username is missing', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('msg');
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ username: 'testuser_' + Date.now() });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('msg');
  });

  it('should return 400 when username already exists', async () => {
    const username = 'testuser_' + Date.now();

    // Đăng ký lần đầu
    await request(app)
      .post(baseUrl)
      .send({ username, password: '123456' });

    // Đăng ký lại cùng username
    const res = await request(app)
      .post(baseUrl)
      .send({ username, password: 'abcdef' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('msg');
  });

    afterAll(async () => {
    await pool.query('DELETE FROM users WHERE username LIKE "testuser_%"');
    await pool.end();
  });
});
