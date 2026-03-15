# StudyGram Frontend

**Modern React application with TypeScript, real-time updates, and AI-powered features.**

## 🏗️ Architecture

This frontend follows **Component-Based Architecture** with:
- React Context for global state (auth, theme)
- TanStack Query for server state management
- Socket.io for real-time updates
- React Router for navigation

## 📁 Project Structure

```
frontend/
├── public/               # Static assets
│   ├── icons/
│   └── images/
├── src/
│   ├── components/       # React components
│   │   ├── auth/        # Login, Register, OAuth
│   │   ├── posts/       # Post-related components
│   │   ├── comments/    # Comment components
│   │   ├── profile/     # Profile components
│   │   ├── ai/          # AI feature components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Shadcn UI components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components (routes)
│   ├── services/        # API service layer
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── tests/           # Component tests
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── .env.example         # Example environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
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

   Edit `.env`:
   ```env
   VITE_API_URL=https://localhost:5000/api
   VITE_SOCKET_URL=https://localhost:5000
   VITE_ENVIRONMENT=development
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (require authentication)
- `/feed` - Main feed with all posts
- `/posts/:postId` - Post detail page
- `/posts/create` - Create new post
- `/posts/:postId/edit` - Edit post
- `/profile` - Current user profile
- `/profile/edit` - Edit profile
- `/users/:userId` - View other user's profile

### Error Routes
- `*` - 404 Not Found page

## 🎨 UI Components

Using **Shadcn/ui** component library with Tailwind CSS:

- **Form Components:** Input, Textarea, Select, Checkbox, Radio
- **Layout Components:** Card, Dialog, Sheet, Tabs
- **Feedback Components:** Toast, Alert, Badge, Skeleton
- **Navigation:** Button, Link, Dropdown Menu
- **Data Display:** Avatar, Table, Pagination

### Component Documentation
```bash
# Add new Shadcn component
npx shadcn-ui@latest add <component-name>

# Example: Add dialog component
npx shadcn-ui@latest add dialog
```

## 🔐 Authentication

### Auth Context
```typescript
const { user, login, logout, register, isAuthenticated, isLoading } = useAuth();
```

### Protected Route Example
```typescript
<Route
  path="/feed"
  element={
    <ProtectedRoute>
      <Feed />
    </ProtectedRoute>
  }
/>
```

### Token Management
- Access tokens stored in memory (React state)
- Refresh tokens in httpOnly cookies (managed by backend)
- Automatic token refresh on 401 errors
- Logout clears all auth state

## ⚡ Real-Time Features

### Socket.io Integration
```typescript
const socket = useSocket();

// Subscribe to feed updates
useEffect(() => {
  socket.emit('feed:subscribe');

  socket.on('post:new', (post) => {
    // Handle new post
  });

  return () => {
    socket.off('post:new');
    socket.emit('feed:unsubscribe');
  };
}, [socket]);
```

### Real-Time Events
- **New Posts:** Automatically appear in feed
- **Likes:** Instant like count updates
- **Comments:** Live comment additions
- **Optimistic Updates:** UI updates before server confirmation

## 🤖 AI Features

### Study Tips Generator
```typescript
const { generateStudyTips, isLoading } = useAI();

const tips = await generateStudyTips({
  courseTag: 'Algorithms',
  topic: 'Dynamic Programming'
});
```

### Content Enhancer
```typescript
const { enhanceContent } = useAI();

const suggestions = await enhanceContent({
  content: postContent,
  courseTag: 'Data Structures'
});
```

### Tag Suggester
```typescript
const { suggestTags } = useAI();

const tags = await suggestTags({
  title: postTitle,
  content: postContent
});
```

## 📊 State Management

### Server State (TanStack Query)
```typescript
// Fetch posts
const { data: posts, isLoading, error } = usePosts();

// Create post mutation
const createPostMutation = useCreatePost();
await createPostMutation.mutateAsync(postData);
```

### Client State (React Context)
- **AuthContext:** User authentication state
- **SocketContext:** Socket.io connection
- **ThemeContext:** Dark/light mode preference

### Local Storage
```typescript
const [value, setValue] = useLocalStorage('key', defaultValue);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- PostCard.test.tsx
```

### Test Examples
```typescript
// Component test
test('renders post card with title', () => {
  render(<PostCard post={mockPost} />);
  expect(screen.getByText(mockPost.title)).toBeInTheDocument();
});

// Hook test
test('useAuth provides user when authenticated', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.isAuthenticated).toBe(true);
});

// Integration test with MSW
test('submits login form successfully', async () => {
  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});
```

## 🎨 Styling

### Tailwind CSS
- Utility-first CSS framework
- Responsive design breakpoints
- Dark mode support
- Custom color palette

### Theme Customization
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    },
  },
}
```

### Dark Mode
```typescript
const { theme, toggleTheme } = useTheme();
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start dev server (https://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

### Code Style
- **Linting:** ESLint with React and TypeScript rules
- **Formatting:** Prettier
- **Component Naming:** PascalCase for components, camelCase for utilities

### Development Tips
1. Use React Developer Tools browser extension
2. Enable React strict mode for development
3. Use Vite's HMR for fast refresh
4. Inspect API calls in Network tab

## 📦 Key Dependencies

### Core
- `react` ^18.2.0 - UI library
- `react-dom` ^18.2.0 - React DOM renderer
- `typescript` ^5.3.0 - Type safety

### Routing
- `react-router-dom` ^6.20.0 - Client-side routing

### State Management
- `@tanstack/react-query` ^5.10.0 - Server state management
- `axios` ^1.6.0 - HTTP client

### Real-Time
- `socket.io-client` ^4.6.0 - Socket.io client

### Forms
- `react-hook-form` ^7.48.0 - Form management
- `zod` ^3.22.0 - Schema validation

### UI
- `tailwindcss` ^3.3.0 - CSS framework
- `lucide-react` - Icon library
- `react-hot-toast` ^2.4.0 - Toast notifications
- `date-fns` ^3.0.0 - Date formatting

### Testing
- `vitest` ^1.0.0 - Test runner
- `@testing-library/react` ^14.1.0 - React testing utilities
- `@testing-library/user-event` ^14.5.0 - User interaction simulation
- `msw` ^2.0.0 - API mocking

## 🌐 Environment Variables

```env
# API endpoint
VITE_API_URL=https://localhost:5000/api

# Socket.io endpoint
VITE_SOCKET_URL=https://localhost:5000

# Environment
VITE_ENVIRONMENT=development
```

Note: All Vite env variables must be prefixed with `VITE_`

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

The `dist/` folder contains the production-ready static files.

## 🐛 Debugging

### React DevTools
Install React DevTools browser extension for component inspection.

### Vite Debug Mode
```bash
DEBUG=vite:* npm run dev
```

### Common Issues

**Issue:** HTTPS certificate warning
- **Solution:** Accept the self-signed certificate in browser

**Issue:** API requests failing with CORS error
- **Solution:** Ensure backend is running and CORS configured for https://localhost:3000

**Issue:** Hot reload not working
- **Solution:** Check Vite config and ensure files are within `src/`

## 📱 Responsive Design

Breakpoints:
- `sm`: 640px - Small devices
- `md`: 768px - Medium devices
- `lg`: 1024px - Large devices
- `xl`: 1280px - Extra large devices
- `2xl`: 1536px - 2x extra large

Example:
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Responsive layout */}
</div>
```

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

## 📝 Notes

- All images lazy-loaded for performance
- Service Worker for offline support (optional)
- Code splitting for optimal bundle size
- SEO meta tags for public pages

---

**Frontend Status:** ✅ Ready for Development
