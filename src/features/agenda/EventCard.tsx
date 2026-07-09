import { useTranslation } from 'react-i18next';
import type { FiestaEvent } from '../../types';
import { onActivateKey } from '../../utils/a11y';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: FiestaEvent;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function EventCard({ event, isFavorite, onOpen, onToggleFavorite }: EventCardProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.card} onClick={onOpen} onKeyDown={onActivateKey(onOpen)} role="button" tabIndex={0}>
      {/* Hora */}
      <div className={styles.timeBlock}>
        <div className={styles.timeValue}>{event.time}</div>
        <div className={styles.timeUnit}>h</div>
      </div>

      {/* Dot */}
      <div className={styles.dot}>
        <div className={styles.dotCircle} />
      </div>

      {/* Contenido */}
      <div className={styles.content}>
        <div className={styles.title}>{event.title}</div>
        <div className={styles.location}>📍 {event.location}</div>
      </div>

      {/* Botón favorito */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(event.id); }}
        className={`${styles.favBtn}${isFavorite ? ` ${styles.active}` : ''}`}
        aria-label={isFavorite ? t('eventCard.removeFavorite') : t('eventCard.addFavorite')}
      >
        {isFavorite ? '♥' : '♡'}
      </button>
    </div>
  );
}
