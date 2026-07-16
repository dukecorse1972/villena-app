import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TabBar from './components/TabBar';
import InicioPage from './features/inicio/InicioPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { usePushNotifications } from './hooks/usePushNotifications';
import { toggleFavorite } from './services/eventsService';
import { ROUTES, STORAGE_KEYS } from './constants';
import type { FiestaEvent, Favorites } from './types';

// El resto de páginas no hacen falta en el primer render — cada una se
// descarga en su propio chunk solo cuando el usuario navega a ella (Admin
// es la que más pesa evitar para un usuario normal, que nunca la visita).
const AgendaPage    = lazy(() => import('./features/agenda/AgendaPage'));
const ComparsasPage = lazy(() => import('./features/comparsas/ComparsasPage'));
const MusicaPage    = lazy(() => import('./features/musica/MusicaPage'));
const InfoPage      = lazy(() => import('./features/info/InfoPage'));
const AdminPage     = lazy(() => import('./features/admin/AdminPage'));
const EventModal    = lazy(() => import('./features/agenda/EventModal'));

function RouteFallback({ appBg }: { appBg: string }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: appBg, color: 'rgba(255,255,255,.6)', fontSize: 14 }}>
      {t('common.loading')}
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useAndroidBackButton();
  usePushNotifications();

  const [homeEvent, setHomeEvent] = useState<FiestaEvent | null>(null);
  const [favorites, setFavorites] = useLocalStorage<Favorites>(STORAGE_KEYS.FAVORITES, {});

  const goToServicios = () => navigate(`${ROUTES.INFO}?view=servicios`);
  const goToAvisos    = () => navigate(`${ROUTES.INFO}?view=avisos`);

  const handleToggleFavorite = (id: string) =>
    setFavorites((prev) => toggleFavorite(id, prev));

  const appBg = pathname === ROUTES.MUSICA ? '#02120a' : '#0b1a0b';

  return (
    <div style={{ width: '100%', height: '100dvh', background: appBg, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Área de contenido — scroll aquí, no dentro de las páginas */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 'calc(var(--tab-height) + var(--safe-bottom))' }}>
        <Suspense fallback={<RouteFallback appBg={appBg} />}>
          <Routes>
            <Route path={ROUTES.INICIO}    element={
              <InicioPage
                onGoToServicios={goToServicios}
                onGoToAgenda={() => navigate(ROUTES.AGENDA)}
                onGoToAvisos={goToAvisos}
                onEventClick={setHomeEvent}
              />
            } />
            <Route path={ROUTES.AGENDA}    element={<AgendaPage />} />
            <Route path={ROUTES.COMPARSAS} element={<ComparsasPage />} />
            <Route path={ROUTES.MUSICA}    element={<MusicaPage />} />
            <Route path={ROUTES.INFO}      element={<InfoPage />} />
            <Route path={ROUTES.ADMIN}     element={<AdminPage />} />
            <Route path="*"                element={<Navigate to={ROUTES.INICIO} replace />} />
          </Routes>
        </Suspense>
      </div>

      {/* TabBar fija */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        <TabBar />
      </div>

      {/* Modal de evento desde home */}
      {homeEvent && (
        <Suspense fallback={null}>
          <EventModal
            event={homeEvent}
            isFavorite={!!favorites[homeEvent.id]}
            onClose={() => setHomeEvent(null)}
            onToggleFavorite={handleToggleFavorite}
          />
        </Suspense>
      )}

    </div>
  );
}
