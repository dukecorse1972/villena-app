import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import TabBar from './components/TabBar';
import InicioPage    from './features/inicio/InicioPage';
import AgendaPage    from './features/agenda/AgendaPage';
import ComparsasPage from './features/comparsas/ComparsasPage';
import MusicaPage    from './features/musica/MusicaPage';
import InfoPage      from './features/info/InfoPage';
import AdminPage     from './features/admin/AdminPage';
import EventModal    from './features/agenda/EventModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { toggleFavorite } from './services/eventsService';
import { ROUTES, STORAGE_KEYS } from './constants';
import type { FiestaEvent, Favorites } from './types';

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useAndroidBackButton();

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
      </div>

      {/* TabBar fija */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        <TabBar />
      </div>

      {/* Modal de evento desde home */}
      {homeEvent && (
        <EventModal
          event={homeEvent}
          isFavorite={!!favorites[homeEvent.id]}
          onClose={() => setHomeEvent(null)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

    </div>
  );
}
