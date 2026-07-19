import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Auth from './Auth';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      resetPasswordForEmail: vi.fn(),
    },
    from: () => ({ update: mockUpdate }),
  },
  isSupabaseConfigured: true,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

function renderAuth(query = '?mode=login') {
  return render(
    <MemoryRouter initialEntries={[`/auth${query}`]}>
      <Auth isRtl={true} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Auth — login', () => {
  it('renders email and password fields', () => {
    renderAuth();
    expect(document.querySelector('input[type=email]')).toBeInTheDocument();
    expect(document.querySelector('input[type=password]')).toBeInTheDocument();
  });

  it('submits credentials to Supabase', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    renderAuth();
    await userEvent.type(document.querySelector('input[type=email]')!, 'a@b.co');
    await userEvent.type(document.querySelector('input[type=password]')!, 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /התחבר/ }));
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith({ email: 'a@b.co', password: 'secret123' })
    );
  });

  it('shows a friendly error for wrong credentials', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    mockSignIn.mockImplementation(() => {
      throw new Error('Invalid login credentials');
    });
    renderAuth();
    await userEvent.type(document.querySelector('input[type=email]')!, 'a@b.co');
    await userEvent.type(document.querySelector('input[type=password]')!, 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /התחבר/ }));
    await waitFor(() => expect(screen.getByText(/Invalid login credentials/)).toBeInTheDocument());
  });

  it('asks for an email before sending a password reset', async () => {
    renderAuth();
    await userEvent.click(screen.getByText(/שכחת סיסמה/));
    await waitFor(() => expect(screen.getByText(/הזן את האימייל שלך קודם/)).toBeInTheDocument());
  });
});

describe('Auth — signup wizard', () => {
  it('starts at role selection', () => {
    renderAuth('?mode=signup');
    expect(screen.getByText(/אני מתלמד/)).toBeInTheDocument();
    expect(screen.getByText(/אני מנטור/)).toBeInTheDocument();
  });

  it('jumps to step 2 when a role is preselected via URL', () => {
    renderAuth('?mode=signup&role=mentor');
    expect(screen.getByText(/מה המטרה שלך/)).toBeInTheDocument();
  });

  it('requires the details fields before creating an account', async () => {
    renderAuth('?mode=signup&role=mentee');
    await userEvent.click(screen.getByRole('button', { name: /^המשך$/ }));
    const submit = await screen.findByRole('button', { name: /צור חשבון/ });
    await userEvent.click(submit);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('passes role and profile metadata to signUp', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null });
    renderAuth('?mode=signup&role=mentee');
    await userEvent.click(screen.getByRole('button', { name: /^המשך$/ }));
    await screen.findByRole('button', { name: /צור חשבון/ });

    const inputs = [...document.querySelectorAll('form input')] as HTMLInputElement[];
    const byType = (t: string) => inputs.filter((i) => i.type === t);
    await userEvent.type(byType('text')[0], 'בדיקה');
    await userEvent.type(byType('email')[0], 'new@test.co');
    await userEvent.type(byType('password')[0], 'secret123');
    await userEvent.type(byType('text')[1], 'חיפה');

    await userEvent.click(screen.getByRole('button', { name: /צור חשבון/ }));
    await waitFor(() => expect(mockSignUp).toHaveBeenCalled());
    const call = mockSignUp.mock.calls[0][0];
    expect(call.email).toBe('new@test.co');
    expect(call.options.data.role).toBe('mentee');
    expect(call.options.data.location).toBe('חיפה');
  });
});
