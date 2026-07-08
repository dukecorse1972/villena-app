import { typePhotos, typeDescs, locCoords } from '../../data/events';
import type { FiestaEvent } from '../../types';
import { openExternalLink } from '../../utils/openExternalLink';
import styles from './EventModal.module.css';

interface EventModalProps {
  event: FiestaEvent | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function EventModal({ event, isFavorite, onClose, onToggleFavorite }: EventModalProps) {
  if (!event) return null;

  const photo   = typePhotos[event.type]    ?? typePhotos['Cultural'];
  const desc    = typeDescs[event.type]     ?? '';
  const coords  = locCoords[event.location] ?? ([38.6322, -0.8677] as [number, number]);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + ' Villena')}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

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

        {/* ── Mapa placeholder ── */}
        <div className={styles.mapBlock}>
          <div className={styles.mapGrid} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(196,151,42,.4)" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className={styles.mapLabel}>MAPA</span>
          <span className={styles.mapCoords}>{coords[0].toFixed(4)}, {coords[1].toFixed(4)}</span>
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
              onClick={() => onToggleFavorite(event.id)}
              className={`${styles.btnFav}${isFavorite ? ` ${styles.saved}` : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? '#c4972a' : 'none'} stroke="#c4972a" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className={styles.btnFavLabel}>
                {isFavorite ? 'Guardado' : 'Guardar'}
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
              <span className={styles.btnNavLabel}>CÓMO LLEGAR</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
