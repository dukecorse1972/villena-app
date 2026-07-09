import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { PointOfInterest, Ruta } from '../../types';
import { getPois } from '../../services/poisService';
import { getRutas } from '../../services/rutasService';
import { onActivateKey } from '../../utils/a11y';
import styles from './MapPage.module.css';

const MapView = lazy(() => import('../../components/MapView'));

interface MapPageProps {
  onBack: () => void;
}

export default function MapPage({ onBack }: MapPageProps) {
  const { t } = useTranslation();
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [selectedRutaId, setSelectedRutaId] = useState<string>('');

  useEffect(() => {
    getPois().then(setPois).catch(() => setPois([]));
    getRutas().then(setRutas).catch(() => setRutas([]));
  }, []);

  const selectedRuta = rutas.find((r) => r.id === selectedRutaId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div
          className={styles.backBtn}
          onClick={onBack}
          onKeyDown={onActivateKey(onBack)}
          role="button"
          tabIndex={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className={styles.backLabel}>{t('mapPage.back')}</span>
        </div>
        <h1 className={styles.title}>{t('mapPage.title')}</h1>
      </div>

      {rutas.length > 0 && (
        <div className={styles.rutaPicker}>
          <label className={styles.rutaLabel} htmlFor="ruta-select">{t('mapPage.viewRoute')}</label>
          <select
            id="ruta-select"
            className={styles.rutaSelect}
            value={selectedRutaId}
            onChange={(e) => setSelectedRutaId(e.target.value)}
          >
            <option value="">{t('mapPage.noneOnlyPois')}</option>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.mapWrap}>
        <Suspense fallback={<p className={styles.loading}>{t('mapPage.loadingMap')}</p>}>
          <MapView pois={pois} route={selectedRuta?.path} height="100%" />
        </Suspense>
      </div>
    </div>
  );
}
