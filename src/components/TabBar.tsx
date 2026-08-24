import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../constants';
import { triggerSelectionHaptic } from '../utils/haptics';
import type { TabId } from '../types';
import styles from './TabBar.module.css';

// Mapeo bidireccional tab ↔ ruta
const TAB_ROUTES: Record<TabId, string> = {
  inicio:    ROUTES.INICIO,
  agenda:    ROUTES.AGENDA,
  comparsas: ROUTES.COMPARSAS,
  musica:    ROUTES.MUSICA,
  info:      ROUTES.INFO,
};

const TABS: { id: TabId; labelKey: string; icon: React.ReactNode }[] = [
  {
    id: 'inicio',
    labelKey: 'tabBar.inicio',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    id: 'agenda',
    labelKey: 'tabBar.agenda',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'comparsas',
    labelKey: 'tabBar.comparsas',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: 'musica',
    labelKey: 'tabBar.musica',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6"  cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    id: 'info',
    labelKey: 'tabBar.info',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3"  y="3"  width="7" height="7"/>
        <rect x="14" y="3"  width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3"  y="14" width="7" height="7"/>
      </svg>
    ),
  },
];

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  // Determinar tab activo comparando pathname con las rutas registradas
  const activeTab = (Object.entries(TAB_ROUTES) as [TabId, string][])
    .find(([, route]) => pathname === route || (route !== ROUTES.INICIO && pathname.startsWith(route)))
    ?.[0] ?? 'inicio';

  return (
    <div className={styles.bar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (isActive) return;
              triggerSelectionHaptic();
              navigate(TAB_ROUTES[tab.id]);
            }}
            className={`${styles.tab}${isActive ? ` ${styles.tabActive}` : ''}`}
          >
            {tab.icon}
            <span className={styles.label}>{t(tab.labelKey)}</span>
            <div className={styles.dot} />
          </button>
        );
      })}
    </div>
  );
}
