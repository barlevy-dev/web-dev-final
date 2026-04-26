import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
}

describe('RegisterForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders username, email, password fields and submit button', () => {
    renderRegisterForm();
    expect(screen.getByPlaceholderText(/studystar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders a link to /login', () => {
    renderRegisterForm();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error for username shorter than 3 characters', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByPlaceholderText(/studystar/i), 'ab');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('shows error for password without digits', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByPlaceholderText(/studystar/i), 'validuser');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'NoDigitsHere');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least one number/i)).toBeInTheDocument();
    });
  });

  it('calls register with correct args on valid submit', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);
    renderRegisterForm();

    await user.type(screen.getByPlaceholderText(/studystar/i), 'newuser');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'new@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'Pass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'newuser', 'Pass123');
    });
  });

  it('shows server error on duplicate email', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce({
      response: { data: { message: 'Email already registered' } },
    });
    renderRegisterForm();

    await user.type(screen.getByPlaceholderText(/studystar/i), 'newuser');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'dup@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'Pass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });
});
