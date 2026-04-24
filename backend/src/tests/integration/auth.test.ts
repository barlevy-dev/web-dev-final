import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { validUser } from '../helpers/mockData';

beforeAll(() => {
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
  process.env.JWT_EXPIRES_IN = '15m';
  process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return accessToken', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).toMatchObject({
      email: validUser.email,
      username: validUser.username,
    });
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should set a httpOnly refreshToken cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'cookie@example.com', username: 'cookieuser' });

    expect(res.status).toBe(201);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(Array.isArray(cookies) ? cookies.some((c: string) => c.startsWith('refreshToken=')) : cookies.startsWith('refreshToken=')).toBe(true);
  });

  it('should return 409 when email is already registered', async () => {
    await User.create({
      email: 'dup@example.com',
      username: 'uniqueuser1',
      password: 'Test123456',
      authProvider: 'local',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'dup@example.com', username: 'otherunique' });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Email already registered');
  });

  it('should return 409 when username is already taken', async () => {
    await User.create({
      email: 'unique@example.com',
      username: 'takenuser',
      password: 'Test123456',
      authProvider: 'local',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'another@example.com', username: 'takenuser' });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Username already taken');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for password without digits', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'NoDigitsHere' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'login@example.com', username: 'loginuser' });
  });

  it('should login with valid credentials and return accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe('login@example.com');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Test123456' });

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should issue a new accessToken with a valid refresh cookie', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'refresh@example.com', username: 'refreshuser' });

    const cookie = registerRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should return 401 when no refresh cookie is present', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Refresh token is required');
  });

  it('should return 401 for an invalid refresh token value', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=invalid.token.value');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should logout and clear the refresh cookie', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'logout@example.com', username: 'logoutuser' });

    const cookie = registerRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toContain('Logged out');

    const clearedCookie = res.headers['set-cookie'];
    expect(clearedCookie).toBeDefined();
  });

  it('should return 200 even without a refresh cookie (idempotent)', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should clear the refreshToken in the database', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'logoutdb@example.com', username: 'logoutdbuser' });

    const cookie = registerRes.headers['set-cookie'];

    await request(app).post('/api/auth/logout').set('Cookie', cookie);

    const user = await User.findOne({ email: 'logoutdb@example.com' }).select('+refreshToken');
    expect(user?.refreshToken).toBeUndefined();
  });
});
