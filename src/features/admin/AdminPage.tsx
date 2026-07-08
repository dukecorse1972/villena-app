import { useState } from 'react';
import AdminGuard from './AdminGuard';
import AdminAvisosPanel from './AdminAvisosPanel';
import styles from './AdminPage.module.css';

type Section = 'avisos' | 'eventos' | 'comparsas';

const SECTIONS: { id: Section; label: string; ready: boolean }[] = [
  { id: 'avisos',    label: 'Avisos',    ready: true },
  { id: 'eventos',   label: 'Eventos',   ready: false },
  { id: 'comparsas', label: 'Comparsas', ready: false },
];

/**
 * Punto de entrada del backoffice (Fase 1, Tanda 3).
 * 3.1: cimientos de acceso. 3.2: Avisos (esta sub-tanda). 3.3/3.4:
 * Eventos y Comparsas, todavía como "Próximamente" aquí mismo.
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
        {section === 'eventos' && <div className={styles.comingSoon}>Gestión de eventos — próximamente.</div>}
        {section === 'comparsas' && <div className={styles.comingSoon}>Gestión de comparsas y cargos — próximamente.</div>}
      </div>
    </AdminGuard>
  );
}
