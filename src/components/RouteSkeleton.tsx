import Skeleton from './Skeleton';
import styles from './Skeleton.module.css';

/**
 * Esqueleto estructurado para rutas lazy durante la carga,
 * evitando destellos de texto plano.
 */
export default function RouteSkeleton() {
  return (
    <div className={styles.routeContainer}>
      {/* Cabecera / Título */}
      <div className={styles.headerRow}>
        <Skeleton width="160px" height="28px" borderRadius="6px" />
        <Skeleton width="40px" height="40px" borderRadius="50%" />
      </div>

      {/* Hero / Banner principal */}
      <Skeleton className={styles.heroCard} />

      {/* Chips de filtro */}
      <div className={styles.chipRow}>
        <Skeleton className={styles.chip} />
        <Skeleton className={styles.chip} />
        <Skeleton className={styles.chip} />
        <Skeleton className={styles.chip} />
      </div>

      {/* Lista de tarjetas */}
      <Skeleton className={styles.card} />
      <Skeleton className={styles.card} />
      <Skeleton className={styles.card} />
    </div>
  );
}
