import request from 'supertest';
import app from '../../app';
import { Types } from 'mongoose';
import { createTestUser, createTestPost, generateTestAccessToken, getAuthHeader } from '../helpers/testUtils';

beforeAll(() => {
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
});

describe('GET /api/users/me', () => {
  it('should return the authenticated user profile', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .get('/api/users/me')
      .set(getAuthHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toMatchObject({
      email: user.email,
      username: user.username,
    });
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 401 without an auth token', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(401);
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid.token');

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/me', () => {
  it('should update username, yearOfStudy, and degree', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .put('/api/users/me')
      .set(getAuthHeader(token))
      .send({ username: 'updatedname', yearOfStudy: '4th Year', degree: 'Physics' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('updatedname');
    expect(res.body.data.user.yearOfStudy).toBe('4th Year');
    expect(res.body.data.user.degree).toBe('Physics');
  });

  it('should allow partial update with only one field', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .put('/api/users/me')
      .set(getAuthHeader(token))
      .send({ yearOfStudy: '2nd Year' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.yearOfStudy).toBe('2nd Year');
  });

  it('should return 409 when username is already taken by another user', async () => {
    const user1 = await createTestUser({ email: 'u1@example.com', username: 'userone' });
    await createTestUser({ email: 'u2@example.com', username: 'usertwo' });

    const token = generateTestAccessToken({
      userId: String(user1._id),
      email: user1.email,
      username: user1.username,
    });

    const res = await request(app)
      .put('/api/users/me')
      .set(getAuthHeader(token))
      .send({ username: 'usertwo' });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Username already taken');
  });

  it('should return 400 for invalid username (too short)', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .put('/api/users/me')
      .set(getAuthHeader(token))
      .send({ username: 'ab' });

    expect(res.status).toBe(400);
  });

  it('should return 401 without an auth token', async () => {
    const res = await request(app).put('/api/users/me').send({ yearOfStudy: '1st Year' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:userId', () => {
  it('should return a public user profile by id', async () => {
    const user = await createTestUser();

    const res = await request(app).get(`/api/users/${user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toMatchObject({
      email: user.email,
      username: user.username,
    });
  });

  it('should return 404 for a non-existent user id', async () => {
    const fakeId = new Types.ObjectId().toHexString();

    const res = await request(app).get(`/api/users/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('User not found');
  });

  it('should return 500 for a malformed user id', async () => {
    const res = await request(app).get('/api/users/not-a-valid-id');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('GET /api/users/:userId/posts', () => {
  it('should return posts created by the user', async () => {
    const user = await createTestUser();
    await createTestPost(user._id as Types.ObjectId);
    await createTestPost(user._id as Types.ObjectId);

    const res = await request(app).get(`/api/users/${user._id}/posts`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.posts).toHaveLength(2);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.total).toBe(2);
  });

  it('should return empty array for user with no posts', async () => {
    const user = await createTestUser();

    const res = await request(app).get(`/api/users/${user._id}/posts`);

    expect(res.status).toBe(200);
    expect(res.body.data.posts).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('should support pagination', async () => {
    const user = await createTestUser();
    for (let i = 0; i < 5; i++) {
      await createTestPost(user._id as Types.ObjectId);
    }

    const res = await request(app).get(`/api/users/${user._id}/posts?page=1&limit=3`);

    expect(res.status).toBe(200);
    expect(res.body.data.posts).toHaveLength(3);
    expect(res.body.data.pagination.pages).toBe(2);
  });
});
