const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

describe('User Endpoints', () => {
  let adminToken, regularToken;
  let adminUser, regularUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    // Create test users
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });

    regularUser = await User.create({
      username: 'regular',
      email: 'regular@example.com',
      password: 'password123',
    });

    // Generate tokens
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'testsecret');
    regularToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET || 'testsecret');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/users', () => {
    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should not allow regular user to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow admin to get user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toEqual('regular');
      expect(res.body.email).toEqual('regular@example.com');
    });

    it('should not allow regular user to get user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow admin to update user', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'updateduser',
          email: 'updated@example.com',
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toEqual('updateduser');
      expect(res.body.email).toEqual('updated@example.com');
    });

    it('should not allow regular user to update users', async () => {
      const res = await request(app)
        .put(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          username: 'changedadmin',
        });
      
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const userToDelete = await User.create({
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .delete(`/api/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });

    it('should not allow regular user to delete users', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toEqual(403);
    });
  });
});