import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminGuard from './AdminGuard';

const useAuthMock = vi.fn();
const useIsAdminMock = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../../hooks/useIsAdmin', () => ({
  useIsAdmin: () => useIsAdminMock(),
}));

describe('AdminGuard', () => {
  it('muestra "comprobando acceso" mientras se resuelve la sesión', () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: true });
    useIsAdminMock.mockReturnValue({ isAdmin: false, isLoading: true });

    render(<AdminGuard><div>Contenido secreto</div></AdminGuard>);

    expect(screen.getByText(/comprobando acceso/i)).toBeInTheDocument();
    expect(screen.queryByText('Contenido secreto')).not.toBeInTheDocument();
  });

  it('pide iniciar sesión si no hay usuario autenticado', () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false });
    useIsAdminMock.mockReturnValue({ isAdmin: false, isLoading: false });

    render(<AdminGuard><div>Contenido secreto</div></AdminGuard>);

    expect(screen.getByText(/inicia sesión/i)).toBeInTheDocument();
    expect(screen.queryByText('Contenido secreto')).not.toBeInTheDocument();
  });

  it('deniega el acceso si hay usuario pero no es administrador', () => {
    useAuthMock.mockReturnValue({ user: { email: 'festero@example.com' }, isLoading: false });
    useIsAdminMock.mockReturnValue({ isAdmin: false, isLoading: false });

    render(<AdminGuard><div>Contenido secreto</div></AdminGuard>);

    expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
    expect(screen.queryByText('Contenido secreto')).not.toBeInTheDocument();
  });

  it('muestra el contenido protegido si el usuario es administrador', () => {
    useAuthMock.mockReturnValue({ user: { email: 'admin@jcfvillena.es' }, isLoading: false });
    useIsAdminMock.mockReturnValue({ isAdmin: true, isLoading: false });

    render(<AdminGuard><div>Contenido secreto</div></AdminGuard>);

    expect(screen.getByText('Contenido secreto')).toBeInTheDocument();
  });
});
