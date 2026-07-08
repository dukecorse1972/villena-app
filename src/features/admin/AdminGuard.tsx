import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import LoginSection from '../info/LoginSection';
import styles from './AdminGuard.module.css';

interface Props {
  children: ReactNode;
}

/**
 * Protege una sección de la app para que solo la vean usuarios
 * autenticados que además estén en la tabla `admins` de Supabase.
 * El acceso real (RLS) lo sigue decidiendo la base de datos; esto
 * solo evita mostrar la UI de edición a quien no la puede usar.
 */
export default function AdminGuard({ children }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [loginOpen, setLoginOpen] = useState(false);

  if (authLoading || adminLoading) {
    return (
      <div className={styles.wrap}>
        <p className={styles.text}>Comprobando acceso…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Panel de administración</h1>
        <p className={styles.text}>Inicia sesión con una cuenta autorizada para entrar.</p>
        <button className={styles.loginBtn} onClick={() => setLoginOpen(true)}>
          Iniciar sesión
        </button>
        <LoginSection open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Acceso restringido</h1>
        <p className={styles.text}>
          Tu cuenta ({user.email}) no tiene permisos de administración del backoffice.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
