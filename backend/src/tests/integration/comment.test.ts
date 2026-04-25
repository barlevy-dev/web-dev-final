import request from 'supertest';
import app from '../../app';
import { Types } from 'mongoose';
import {
  createTestUser,
  createTestPost,
  createTestComment,
  generateTestAccessToken,
  getAuthHeader,
} from '../helpers/testUtils';

beforeAll(() => {
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
});

describe('GET /api/posts/:postId/comments', () => {
  it('should return comments for a post', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);
    await createTestComment(post._id as Types.ObjectId, user._id as Types.ObjectId);
    await createTestComment(post._id as Types.ObjectId, user._id as Types.ObjectId);

    const res = await request(app).get(`/api/posts/${post._id}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.comments).toHaveLength(2);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should return empty array when post has no comments', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);

    const res = await request(app).get(`/api/posts/${post._id}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('should return 404 for a non-existent post', async () => {
    const fakeId = new Types.ObjectId().toHexString();

    const res = await request(app).get(`/api/posts/${fakeId}/comments`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Post not found');
  });

  it('should support pagination', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);
    for (let i = 0; i < 5; i++) {
      await createTestComment(post._id as Types.ObjectId, user._id as Types.ObjectId);
    }

    const res = await request(app).get(`/api/posts/${post._id}/comments?page=1&limit=3`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments).toHaveLength(3);
    expect(res.body.data.pagination.total).toBe(5);
    expect(res.body.data.pagination.pages).toBe(2);
  });
});

describe('POST /api/posts/:postId/comments', () => {
  it('should create a comment when authenticated', async () => {
    const author = await createTestUser();
    const post = await createTestPost(author._id as Types.ObjectId);
    const token = generateTestAccessToken({
      userId: String(author._id),
      email: author.email,
      username: author.username,
    });

    const res = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set(getAuthHeader(token))
      .send({ content: 'Great post! Really helpful.' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.comment.content).toBe('Great post! Really helpful.');
    expect(res.body.data.comment.authorName).toBe(author.username);
  });

  it('should increment the post commentsCount after creating a comment', async () => {
    const author = await createTestUser({ email: 'cmtcount@example.com', username: 'cmtcntuser' });
    const post = await createTestPost(author._id as Types.ObjectId);
    const token = generateTestAccessToken({
      userId: String(author._id),
      email: author.email,
      username: author.username,
    });

    expect(post.commentsCount).toBe(0);

    await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set(getAuthHeader(token))
      .send({ content: 'First comment.' });

    const postsRes = await request(app).get(`/api/posts/${post._id}`);
    expect(postsRes.body.data.post.commentsCount).toBe(1);
  });

  it('should return 400 for empty comment content', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set(getAuthHeader(token))
      .send({ content: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for content exceeding 500 characters', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const res = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set(getAuthHeader(token))
      .send({ content: 'a'.repeat(501) });

    expect(res.status).toBe(400);
  });

  it('should return 401 without an auth token', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);

    const res = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .send({ content: 'Unauthenticated comment.' });

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
      .post(`/api/posts/${fakeId}/comments`)
      .set(getAuthHeader(token))
      .send({ content: 'Comment on ghost post.' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/comments/:commentId', () => {
  it('should delete a comment when the author is authenticated', async () => {
    const author = await createTestUser({ email: 'del_author@example.com', username: 'delauthor' });
    const post = await createTestPost(author._id as Types.ObjectId);
    const comment = await createTestComment(post._id as Types.ObjectId, author._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(author._id),
      email: author.email,
      username: author.username,
    });

    const res = await request(app)
      .delete(`/api/comments/${comment._id}`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Comment deleted successfully');
  });

  it('should return 403 when a non-author tries to delete', async () => {
    const author = await createTestUser({ email: 'auth_cmt@example.com', username: 'authcmt' });
    const other = await createTestUser({ email: 'other_cmt@example.com', username: 'othercmt' });
    const post = await createTestPost(author._id as Types.ObjectId);
    const comment = await createTestComment(post._id as Types.ObjectId, author._id as Types.ObjectId);

    const token = generateTestAccessToken({
      userId: String(other._id),
      email: other.email,
      username: other.username,
    });

    const res = await request(app)
      .delete(`/api/comments/${comment._id}`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Not authorized');
  });

  it('should return 401 without an auth token', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user._id as Types.ObjectId);
    const comment = await createTestComment(post._id as Types.ObjectId, user._id as Types.ObjectId);

    const res = await request(app).delete(`/api/comments/${comment._id}`);

    expect(res.status).toBe(401);
  });

  it('should return 404 for a non-existent comment', async () => {
    const user = await createTestUser();
    const token = generateTestAccessToken({
      userId: String(user._id),
      email: user.email,
      username: user.username,
    });

    const fakeId = new Types.ObjectId().toHexString();
    const res = await request(app)
      .delete(`/api/comments/${fakeId}`)
      .set(getAuthHeader(token));

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Comment not found');
  });
});
