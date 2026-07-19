import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderAt(path: string, requireAuth: boolean) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/app/secret"
          element={
            <ProtectedRoute requireAuth={requireAuth}>
              <div>secret content</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute requireAuth={requireAuth}>
              <div>public content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>auth page</div>} />
        <Route path="/app/opportunities" element={<div>app home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows a spinner while auth state is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    const { container } = renderAt('/app/secret', true);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('redirects guests away from protected pages to /auth', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderAt('/app/secret', true);
    expect(screen.getByText('auth page')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('renders protected content for a signed-in user', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, loading: false });
    renderAt('/app/secret', true);
    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('redirects signed-in users away from guest-only pages into the app', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, loading: false });
    renderAt('/', false);
    expect(screen.getByText('app home')).toBeInTheDocument();
    expect(screen.queryByText('public content')).not.toBeInTheDocument();
  });

  it('renders guest-only content for guests', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderAt('/', false);
    expect(screen.getByText('public content')).toBeInTheDocument();
  });
});
