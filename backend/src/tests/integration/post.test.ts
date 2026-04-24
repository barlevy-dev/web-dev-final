import request from 'supertest';
import app from '../../app';
import { Types } from 'mongoose';
import {
  createTestUser,
  createTestPost,
  generateTestAccessToken,
  getAuthHeader,
} from '../helpers/testUtils';
import { validPost } from '../helpers/mockData';

beforeAll(() => {
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
});

describe('GET /api/posts', () => {
  it('should return a paginated list of posts', async () => {
    const user = await createTestUser();
    await createTestPost(user._id as Types.ObjectId);
    await createTestPost(user._id as Types.ObjectId);

    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.posts)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should filter posts by courseTag', async () => {
    const user = await createTestUser();
    await createTestPost(user._id as Types.ObjectId, { courseTag: 'Mathematics' });
    await createTestPost(user._id as Types.ObjectId, { courseTag: 'Physics' });

    const res = await request(app).get('/api/posts?courseTag=Mathematics');

    expect(res.status).toBe(200);
    expect(res.body.data.posts.every((p: any) => p.courseTag === 'Mathematics')).toBe(true);
  });

  it('should filter posts by difficultyLevel', async () => {
    const user = await createTestUser();
    await createTestPost(user._id as Types.ObjectId, { difficultyLevel: 'easy' });
    await createTestPost(user._id as Types.ObjectId, { difficultyLevel: 'hard' });

    const res = await request(app).get('/api/posts?difficultyLevel=easy');

    expect(res.status).toBe(200);
    expect(res.body.data.posts.every((p: any) => p.difficultyLevel === 'easy')).toBe(true);
  });

  it('should return empty array when no posts match filters', async () => {
    const res = await request(app).get('/api/posts?courseTag=NonexistentSubject');

    expect(res.status).toBe(200);
    expect(res.body.data.posts).toHaveLength(0);
  });

  it('should support pagination', async () => {
    const user = await createTestUser();
    for (let i = 0; i < 5; i++) {
      await createTestPost(user._id as Types.ObjectId, { title: `Post ${i}`, courseTag: 'PaginationTest' });
    }

    const res = await request(app).get('/api/posts?courseTag=PaginationTest&page=1&limit=3');

    expect(res.status).toBe(200);
    expect(res.body.data.posts).toHaveLength(3);
    expect(res.body.data.pagination.total).toBe(5);
    expect(res.body.data.pagination.pages).toBe(2);
  });
});

describe('POST /api/posts', () => {
  it('should create a new post when authenticated', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .post('/api/posts')
      .set(getAuthHeader(token))
      .send(validPost);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.post).toMatchObject({
      title: validPost.title,
      courseTag: validPost.courseTag,
      difficultyLevel: validPost.difficultyLevel,
    });
    expect(res.body.data.post.authorName).toBe(user.username);
  });

  it('should return 401 without an auth token', async () => {
    const res = await request(app).post('/api/posts').send(validPost);

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing required fields', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .post('/api/posts')
      .set(getAuthHeader(token))
      .send({ title: 'No content or tags' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid difficultyLevel', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .post('/api/posts')
      .set(getAuthHeader(token))
      .send({ ...validPost, difficultyLevel: 'super-hard' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/posts/:postId', () => {
  it('should return a post by id', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);

    const res = await request(app).get(`/api/posts/${post._id}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.post._id).toBe(String(post._id));
    expect(res.body.data.post.title).toBe(post.title);
  });

  it('should return 404 for a non-existent post id', async () => {
    const fakeId = new Types.ObjectId().toHexString();

    const res = await request(app).get(`/api/posts/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Post not found');
  });
});

describe('PUT /api/posts/:postId', () => {
  it('should update a post when the owner is authenticated', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .set(getAuthHeader(token))
      .send({ title: 'Updated Title', difficultyLevel: 'hard' });

    expect(res.status).toBe(200);
    expect(res.body.data.post.title).toBe('Updated Title');
    expect(res.body.data.post.difficultyLevel).toBe('hard');
  });

  it('should return 403 when a non-owner tries to update', async () => {
    const owner = await createTestUser({ email: 'owner@example.com', username: 'postowner' });
    const other = await createTestUser({ email: 'other@example.com', username: 'otherusr' });
    const post = await createTestPost(owner._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(other._id),
      email: other.email,
      username: other.username,
    });

    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .set(getAuthHeader(token))
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
  });

  it('should return 401 without an auth token', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);

    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .send({ title: 'No Auth' });

    expect(res.status).toBe(401);
  });

  it('should return 404 for a non-existent post', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const fakeId = new Types.ObjectId().toHexString();
    const res = await request(app)
      .put(`/api/posts/${fakeId}`)
      .set(getAuthHeader(token))
      .send({ title: 'Does not exist' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/posts/:postId', () => {
  it('should delete a post when the owner is authenticated', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Post deleted successfully');

    const checkRes = await request(app).get(`/api/posts/${post._id}`);
    expect(checkRes.status).toBe(404);
  });

  it('should return 403 when a non-owner tries to delete', async () => {
    const owner = await createTestUser({ email: 'del_owner@example.com', username: 'delowner' });
    const other = await createTestUser({ email: 'del_other@example.com', username: 'delotherusr' });
    const post = await createTestPost(owner._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(other._id),
      email: other.email,
      username: other.username,
    });

    const res = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(403);
  });

  it('should return 401 without an auth token', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);

    const res = await request(app).delete(`/api/posts/${post._id}`);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/posts/:postId/like', () => {
  it('should like a post and increment like count', async () => {
    const owner = await createTestUser({ email: 'like_owner@example.com', username: 'likeowner' });
    const liker = await createTestUser({ email: 'liker@example.com', username: 'likeruser' });
    const post = await createTestPost(owner._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(liker._id),
      email: liker.email,
      username: liker.username,
    });

    const res = await request(app)
      .post(`/api/posts/${post._id}/like`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.post.likes).toBe(1);
  });

  it('should return 400 when a user tries to like a post they already liked', async () => {
    const owner = await createTestUser({ email: 'dlike_own@example.com', username: 'dlikeown' });
    const liker = await createTestUser({ email: 'dlikertest@example.com', username: 'dlikerusr' });
    const post = await createTestPost(owner._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(liker._id),
      email: liker.email,
      username: liker.username,
    });

    await request(app).post(`/api/posts/${post._id}/like`).set(getAuthHeader(token));

    const res = await request(app)
      .post(`/api/posts/${post._id}/like`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already liked');
  });

  it('should return 401 without an auth token', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);

    const res = await request(app).post(`/api/posts/${post._id}/like`);

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/posts/:postId/like', () => {
  it('should unlike a post and decrement like count', async () => {
    const owner = await createTestUser({ email: 'ulk_own@example.com', username: 'ulkown' });
    const liker = await createTestUser({ email: 'ulker@example.com', username: 'ulkerusr' });
    const post = await createTestPost(owner._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(liker._id),
      email: liker.email,
      username: liker.username,
    });

    await request(app).post(`/api/posts/${post._id}/like`).set(getAuthHeader(token));

    const res = await request(app)
      .delete(`/api/posts/${post._id}/like`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.post.likes).toBe(0);
  });

  it('should return 400 when unliking a post that was not liked', async () => {
    const owner = await createTestUser({ email: 'ulk_own2@example.com', username: 'ulkown2' });
    const user = await createTestUser({ email: 'noliker@example.com', username: 'nolikerusr' });
    const post = await createTestPost(owner._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .delete(`/api/posts/${post._id}/like`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('not liked');
  });
});
