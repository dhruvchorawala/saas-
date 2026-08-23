const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saas_test_db');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'USER'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.token).toBeDefined();
    });

    it('should fail if email already exists', async () => {
      await User.create({
        name: 'Existing',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400); // Or whatever duplicate error code
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login and return a valid JWT', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
    });
  });
});
