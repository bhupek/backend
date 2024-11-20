import request from 'supertest';
import { app } from '../server';
import { clearDatabase, createTestUser } from './utils/testUtils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
import type { Config } from '../config';

describe('Authentication Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'testpass123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createTestUser({ password: hashedPassword });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', user.email);
    });

    it('should fail with invalid credentials', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'teacher',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail when registering with existing email', async () => {
      const existingUser = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: existingUser.email,
          password: 'password123',
          role: 'teacher',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile with valid token', async () => {
      const user = await createTestUser();
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: '1d' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', user.email);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
