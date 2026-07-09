import type { Comparsa } from '../../types';
import { onActivateKey } from '../../utils/a11y';
import styles from './ComparsaCard.module.css';

interface ComparsaCardProps {
  comparsa: Comparsa;
  isLast: boolean;
  onClick: (c: Comparsa) => void;
}

export default function ComparsaCard({ comparsa, isLast, onClick }: ComparsaCardProps) {
  return (
    <div style={isLast ? { gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' } : {}}>
      <div
        onClick={() => onClick(comparsa)}
        onKeyDown={onActivateKey(() => onClick(comparsa))}
        role="button"
        tabIndex={0}
        className={styles.card}
        style={isLast ? { width: 'calc(50% - 6px)' } : {}}
      >
        {/* Logo o emblema */}
        <div
          className={styles.emblem}
          style={{ background: comparsa.img ? 'transparent' : comparsa.color }}
        >
          {comparsa.img ? (
            <img src={comparsa.img} className={styles.emblemImg} alt={comparsa.name} />
          ) : (
            <span>{comparsa.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        {/* Nombre */}
        <div className={styles.name}>{comparsa.name}</div>
      </div>
    </div>
  );
}
