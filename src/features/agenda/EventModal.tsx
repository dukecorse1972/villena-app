import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { typePhotos, typeDescs, locCoords } from '../../data/events';
import { getRutas } from '../../services/rutasService';
import { getPois } from '../../services/poisService';
import type { FiestaEvent, PointOfInterest } from '../../types';
import { openExternalLink } from '../../utils/openExternalLink';
import { useModalA11y } from '../../hooks/useModalA11y';
import { triggerLightImpact } from '../../utils/haptics';
import styles from './EventModal.module.css';

// "Locales de las comparsas" no es un único sitio: cada comparsa tiene el
// suyo. Para ese acto en concreto se muestran todos los locales (POIs de
// categoría "Local de comparsa") en vez de un pin inventado.
const COMPARSA_LOCALES_LOCATION = 'Locales de las comparsas';

// Leaflet pesa ~200KB gzip: se carga solo cuando se abre un evento, no en
// el arranque de la app.
const MapView = lazy(() => import('../../components/MapView'));

interface EventModalProps {
  event: FiestaEvent | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function EventModal({ event, isFavorite, onClose, onToggleFavorite }: EventModalProps) {
  const { t } = useTranslation();
  const [routePath, setRoutePath] = useState<[number, number][] | undefined>(undefined);
  const [comparsaLocales, setComparsaLocales] = useState<PointOfInterest[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useModalA11y(!!event, onClose, panelRef);

  useEffect(() => {
    // Responde a un cambio de evento (otro acto sin ruta), no a un valor
    // derivable en render — mismo patrón ya usado en useAuth/useAgenda.
    if (!event?.ruta_id) { setRoutePath(undefined); return; } // eslint-disable-line react-hooks/set-state-in-effect
    let cancelled = false;
    getRutas().then((rutas) => {
      if (!cancelled) setRoutePath(rutas.find((r) => r.id === event.ruta_id)?.path);
    }).catch(() => { if (!cancelled) setRoutePath(undefined); });
    return () => { cancelled = true; };
  }, [event?.ruta_id]);

  useEffect(() => {
    if (event?.location !== COMPARSA_LOCALES_LOCATION) { setComparsaLocales([]); return; } // eslint-disable-line react-hooks/set-state-in-effect
    let cancelled = false;
    getPois().then((pois) => {
      if (!cancelled) setComparsaLocales(pois.filter((p) => p.category === 'Local de comparsa'));
    }).catch(() => { if (!cancelled) setComparsaLocales([]); });
    return () => { cancelled = true; };
  }, [event?.location]);

  if (!event) return null;

  const photo   = typePhotos[event.type]    ?? typePhotos['Cultural'];
  // Si el admin escribió una descripción propia para este acto, tiene
  // prioridad sobre el genérico por tipo — con `||` (no `??`) para que una
  // descripción vaciada por error caiga igual al genérico en vez de dejar
  // la ficha sin texto.
  const desc    = event.description || typeDescs[event.type] || '';
  // "Plaza de Santiago (salida)" debe encontrar las coordenadas de "Plaza
  // de Santiago" — se busca primero el texto completo y, si no hay
  // coincidencia, sin el sufijo entre paréntesis.
  const baseLocation = event.location.replace(/\s*\([^)]*\)\s*$/, '');
  const coords = locCoords[event.location] ?? locCoords[baseLocation] ?? ([38.6322, -0.8677] as [number, number]);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + ' Villena')}`;

  // Un único pin ad-hoc con la ubicación del acto — no viene de la tabla de
  // POIs, así que se construye aquí en vez de pedir un PointOfInterest real.
  // Excepción: "Locales de las comparsas" muestra los 14 locales reales.
  const locationPin: PointOfInterest[] = routePath ? [] : comparsaLocales.length > 0 ? comparsaLocales : [{
    id: event.id, name: event.location, description: '',
    lat: coords[0], lng: coords[1], category: event.type, icon: '',
  }];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        tabIndex={-1}
      >

        {/* ── Foto superior ── */}
        <div className={styles.photoWrap}>
          <img src={photo} className={styles.photo} alt={event.title} />
          <div className={styles.photoGradient} />

          {/* Botón cerrar */}
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>

          {/* Título + chips */}
          <div className={styles.titleArea}>
            <h2 className={styles.eventTitle}>{event.title}</h2>
            <div className={styles.chips}>
              {/* Hora */}
              <div className={styles.chip}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className={styles.chipText}>{event.time}h</span>
              </div>
              {/* Lugar */}
              <div className={styles.chip}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className={styles.chipTextSub}>{event.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mapa ── */}
        <div className={styles.mapBlock}>
          <Suspense fallback={null}>
            <MapView pois={locationPin} route={routePath} height="100%" rounded={false} />
          </Suspense>
        </div>

        {/* ── Descripción + botones ── */}
        <div className={styles.body}>
          {/* Divisor ornamental */}
          <div className={styles.divider}>
            <div className={`${styles.dividerLine} ${styles.dividerLineLeft}`} />
            <svg width="10" height="10" viewBox="0 0 12 12"><polygon points="6,0 12,6 6,12 0,6" fill="#c4972a" opacity=".6"/></svg>
            <div className={`${styles.dividerLine} ${styles.dividerLineRight}`} />
          </div>

          <p className={styles.desc}>{desc}</p>

          {/* Botones */}
          <div className={styles.btnRow}>
            {/* Favorito */}
            <button
              onClick={() => {
                triggerLightImpact();
                onToggleFavorite(event.id);
              }}
              className={`${styles.btnFav}${isFavorite ? ` ${styles.saved}` : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? '#c4972a' : 'none'} stroke="#c4972a" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className={styles.btnFavLabel}>
                {isFavorite ? t('eventModal.saved') : t('eventModal.save')}
              </span>
            </button>

            {/* Cómo llegar */}
            <a
              href={mapsUrl}
              rel="noopener noreferrer"
              className={styles.btnNav}
              onClick={(e) => { e.preventDefault(); openExternalLink(mapsUrl); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              <span className={styles.btnNavLabel}>{t('eventModal.howToArrive')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
