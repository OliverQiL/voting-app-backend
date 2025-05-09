const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/userModel');
const { Vote, VoteOption } = require('../models/voteModel');
const jwt = require('jsonwebtoken');

describe('Vote Endpoints', () => {
  let adminToken, regularToken, anotherToken;
  let adminUser, regularUser, anotherUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    // Create test users
    adminUser = await User.create({
      username: 'voteadmin',
      email: 'voteadmin@example.com',
      password: 'password123',
      isAdmin: true,
    });

    regularUser = await User.create({
      username: 'voteuser',
      email: 'voteuser@example.com',
      password: 'password123',
    });

    anotherUser = await User.create({
      username: 'anothervoteuser',
      email: 'anothervoteuser@example.com',
      password: 'password123',
    });

    // Generate tokens
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'testsecret');
    regularToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET || 'testsecret');
    anotherToken = jwt.sign({ id: anotherUser._id }, process.env.JWT_SECRET || 'testsecret');

    // Create some vote options
    await VoteOption.create({ name: 'Option A', count: 0 });
    await VoteOption.create({ name: 'Option B', count: 0 });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Vote.deleteMany({});
    await VoteOption.updateMany({}, { count: 0 });
  });

  describe('GET /api/votes/options', () => {
    it('should get all vote options', async () => {
      const res = await request(app).get('/api/votes/options');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/votes', () => {
    it('should allow user to submit a vote for existing option', async () => {
      const res = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ option: 'Option A' });
      
      expect(res.statusCode).toEqual(201);
      
      const option = await VoteOption.findOne({ name: 'Option A' });
      expect(option.count).toEqual(1);
    });

    it('should allow user to submit a vote for a new option', async () => {
      const res = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ option: 'New Option' });
      
      expect(res.statusCode).toEqual(201);
      
      const option = await VoteOption.findOne({ name: 'New Option' });
      expect(option).toBeTruthy();
      expect(option.count).toEqual(1);
    });

    it('should update vote if user votes again', async () => {
      // First vote
      await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ option: 'Option A' });
      
      // Second vote (change)
      const res = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ option: 'Option B' });
      
      expect(res.statusCode).toEqual(200);
      
      const optionA = await VoteOption.findOne({ name: 'Option A' });
      const optionB = await VoteOption.findOne({ name: 'Option B' });
      
      expect(optionA.count).toEqual(0);
      expect(optionB.count).toEqual(1);
    });
  });

  describe('GET /api/votes/results', () => {
    beforeEach(async () => {
      // Setup votes
      await Vote.create({ user: regularUser._id, option: 'Option A' });
      await Vote.create({ user: anotherUser._id, option: 'Option B' });
      
      await VoteOption.updateOne({ name: 'Option A' }, { count: 1 });
      await VoteOption.updateOne({ name: 'Option B' }, { count: 1 });
    });
    
    it('should allow admin to get vote results', async () => {
      const res = await request(app)
        .get('/api/votes/results')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalVotes');
      expect(res.body).toHaveProperty('results');
      expect(res.body.totalVotes).toEqual(2);
      expect(Array.isArray(res.body.results)).toBeTruthy();
    });

    it('should not allow regular user to get vote results', async () => {
      const res = await request(app)
        .get('/api/votes/results')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/votes/me', () => {
    beforeEach(async () => {
      await Vote.deleteMany({});
      await Vote.create({ user: regularUser._id, option: 'Option A' });
    });

    it('should get current user vote', async () => {
      const res = await request(app)
        .get('/api/votes/me')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('option');
      expect(res.body.option).toEqual('Option A');
    });

    it('should return null if user has not voted', async () => {
      const res = await request(app)
        .get('/api/votes/me')
        .set('Authorization', `Bearer ${anotherToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('option');
      expect(res.body.option).toBeNull();
    });
  });
});