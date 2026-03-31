# StudyGram Backend

**Node.js + Express + MongoDB backend with TypeScript, JWT authentication, and real-time features.**

## 🏗️ Architecture

This backend follows a **layered architecture** pattern:

```
Routes → Controllers → Services → Models → Database
                ↓
          Middleware (Auth, Validation, Error Handling)
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files (DB, Passport, Swagger, Socket.io)
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware (auth, validation, error handling)
│   ├── models/           # Mongoose schemas and models
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   ├── sockets/          # Socket.io event handlers
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and helpers
│   ├── tests/            # Unit and integration tests
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── uploads/              # File upload storage
│   ├── profiles/         # Profile images
│   └── posts/            # Post images
├── .env.example          # Example environment variables
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 🚀 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your credentials:
   - MongoDB URI
   - JWT secrets
   - OpenAI API key
   - OAuth credentials (Google, Facebook)

3. **Start MongoDB:**
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod

   # Manual start
   mongod --dbpath=/path/to/data/db
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/facebook` - Facebook OAuth login

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/:userId/posts` - Get user's posts

### Posts
- `GET /api/posts` - Get all posts (with filters)
- `GET /api/posts/:postId` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/like` - Like post
- `DELETE /api/posts/:postId/like` - Unlike post

### Comments
- `GET /api/posts/:postId/comments` - Get post comments
- `POST /api/posts/:postId/comments` - Create comment
- `DELETE /api/comments/:commentId` - Delete comment

### AI Features
- `POST /api/ai/study-tips` - Generate study tips
- `POST /api/ai/enhance-content` - Get content suggestions
- `POST /api/ai/suggest-tags` - Get tag suggestions

### File Upload
- `POST /api/upload/profile` - Upload profile image
- `POST /api/upload/post` - Upload post image

**Full API documentation:** https://localhost:5000/api-docs (when server is running)

## 🔒 Authentication

### JWT Tokens
- **Access Token:** Short-lived (15 minutes), included in Authorization header
- **Refresh Token:** Long-lived (7 days), stored in httpOnly cookie

### Token Refresh Flow
```
1. Access token expires (401)
2. Client calls /api/auth/refresh with refresh token
3. Server validates refresh token and issues new pair
4. Client retries original request with new access token
```

### OAuth Flow
```
1. Client redirects to /api/auth/google or /api/auth/facebook
2. User authenticates with provider
3. Provider redirects to callback URL
4. Server creates/finds user and issues JWT tokens
5. Client receives tokens and completes login
```

## ⚡ Real-Time Events (Socket.io)

### Server-to-Client Events
- `post:new` - New post created
- `post:updated` - Post edited
- `post:deleted` - Post deleted
- `post:liked` - Post liked
- `post:unliked` - Post unliked
- `comment:new` - New comment added
- `comment:deleted` - Comment deleted

### Client-to-Server Events
- `feed:subscribe` - Subscribe to feed updates
- `feed:unsubscribe` - Unsubscribe from feed
- `post:subscribe` - Subscribe to specific post
- `post:unsubscribe` - Unsubscribe from post

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.service.test.ts
```

### Test Structure
- **Unit Tests:** `src/tests/unit/` - Test individual functions/services
- **Integration Tests:** `src/tests/integration/` - Test API endpoints

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

### Code Style
- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier
- **Commit Messages:** Conventional Commits format

## 🌐 Environment Variables

See `.env.example` for all required variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/studygram_dev

# JWT
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# HTTPS
HTTPS_KEY_PATH=../certs/server.key
HTTPS_CERT_PATH=../certs/server.crt
```

## 📊 Database Schema

### User Collection
```typescript
{
  email: string
  username: string
  password?: string (hashed)
  authProvider: 'local' | 'google' | 'facebook'
  providerId?: string
  profileImageUrl?: string
  yearOfStudy: string
  degree: string
  refreshToken?: string
  createdAt: Date
  updatedAt: Date
}
```

### Post Collection
```typescript
{
  userId: ObjectId
  authorName: string
  authorImageUrl?: string
  title: string
  content: string
  courseTag: string
  difficultyLevel: 'easy' | 'medium' | 'hard'
  imageUrl?: string
  likes: number
  likedBy: ObjectId[]
  commentsCount: number
  aiEnhanced: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Comment Collection
```typescript
{
  postId: ObjectId
  userId: ObjectId
  authorName: string
  authorImageUrl?: string
  content: string
  createdAt: Date
  updatedAt: Date
}
```

## 🐛 Debugging

Enable debug logs:
```bash
DEBUG=studygram:* npm run dev
```

## 🚀 Deployment

This backend is designed for **localhost development only**. For production deployment:

1. Update environment variables for production
2. Use proper MongoDB instance (not local)
3. Configure proper HTTPS certificates
4. Set up process manager (PM2)
5. Configure reverse proxy (nginx)
6. Enable production logging

## 📝 Notes

- All passwords are hashed with bcrypt (10 salt rounds)
- Rate limiting: 100 requests per 15 minutes (50 in production)
- AI rate limiting: 10 requests per hour (5 in production)
- Max file upload size: 10MB
- Supported image formats: JPG, PNG, WEBP

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### TypeScript Compilation Errors
```bash
# Clear build cache
rm -rf dist

# Rebuild
npm run build
```

---

**Backend Status:** ✅ Ready for Development
