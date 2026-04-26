import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email, password fields and submit button', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to /register', () => {
    renderLoginForm();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows error when password is empty', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('calls login with correct credentials on valid submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginForm();

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'Password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password1');
    });
  });

  it('shows server error when login API rejects', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password' } },
    });
    renderLoginForm();

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('navigates to / on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginForm();

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'Password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
