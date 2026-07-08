import AdminGuard from './AdminGuard';
import styles from './AdminPage.module.css';

/**
 * Punto de entrada del backoffice (Fase 1, Tanda 3).
 * Sub-tanda 3.1: solo los cimientos de acceso — las pantallas de
 * gestión de avisos/eventos/comparsas llegan en las sub-tandas
 * siguientes (3.2, 3.3, 3.4).
 */
export default function AdminPage() {
  return (
    <AdminGuard>
      <div className={styles.page}>
        <h1>Panel de administración</h1>
        <p>Acceso verificado correctamente. Próximamente: gestión de avisos, eventos y comparsas.</p>
      </div>
    </AdminGuard>
  );
}
