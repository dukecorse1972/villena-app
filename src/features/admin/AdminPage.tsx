import { useState } from 'react';
import AdminGuard from './AdminGuard';
import AdminAvisosPanel from './AdminAvisosPanel';
import AdminEventosPanel from './AdminEventosPanel';
import AdminComparsasPanel from './AdminComparsasPanel';
import AdminRutasPanel from './AdminRutasPanel';
import styles from './AdminPage.module.css';

type Section = 'avisos' | 'eventos' | 'comparsas' | 'rutas';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'avisos',    label: 'Avisos' },
  { id: 'eventos',   label: 'Eventos' },
  { id: 'comparsas', label: 'Comparsas' },
  { id: 'rutas',     label: 'Rutas' },
];

/**
 * Punto de entrada del backoffice (Fase 1, Tanda 3).
 * 3.1: cimientos de acceso. 3.2: Avisos. 3.3: Eventos. 3.4: Comparsas + Cargos.
 */
export default function AdminPage() {
  const [section, setSection] = useState<Section>('avisos');

  return (
    <AdminGuard>
      <div className={styles.page}>
        <h1>Panel de administración</h1>
        <p>Gestiona el contenido de la app sin tocar la base de datos.</p>

        <div className={styles.tabs}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`${styles.tab}${section === s.id ? ` ${styles.active}` : ''}`}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === 'avisos' && <AdminAvisosPanel />}
        {section === 'eventos' && <AdminEventosPanel />}
        {section === 'comparsas' && <AdminComparsasPanel />}
        {section === 'rutas' && <AdminRutasPanel />}
      </div>
    </AdminGuard>
  );
}
