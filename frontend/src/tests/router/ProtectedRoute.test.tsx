import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/router/ProtectedRoute';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

function renderWithRoute(isAuthenticated: boolean, isLoading = false) {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated, isLoading });

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderWithRoute(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRoute(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows a spinner while auth state is loading', () => {
    renderWithRoute(false, true);
    // Should show spinner, not redirect yet
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
