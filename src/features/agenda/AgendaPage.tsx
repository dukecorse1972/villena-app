import { useAgenda } from './useAgenda';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { festiveDays, moroDays, ctianDays, SEP_OFFSET } from '../../data/events';
import styles from './AgendaPage.module.css';

const DAYS_OF_WEEK = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export default function AgendaPage() {
  const {
    selectedDay, setSelectedDay,
    filter, setFilter,
    filterOptions,
    filteredEvents,
    isLoading,
    error,
    selectedEvent, openEvent, closeEvent,
    favorites, toggleFavorite,
  } = useAgenda();

  // Generar celdas del calendario para Sep 2026
  // Sep 2026 empieza el martes → 1 celda vacía (lunes)
  const calCells = [];
  for (let i = 0; i < SEP_OFFSET; i++) calCells.push(null);
  for (let d = 1; d <= 30; d++) calCells.push(d);
  while (calCells.length % 7 !== 0) calCells.push(null);

  return (
    <div className={styles.page}>
      {/* ── Título ── */}
      <div className={styles.titleBar}>
        <h1>Agenda</h1>
      </div>

      {/* ── Calendario ── */}
      <div className={styles.calendar}>
        {/* Cabecera mes + leyenda */}
        <div className={styles.calHeader}>
          <span className={styles.calMonth}>SEPTIEMBRE 2026</span>
          <div className={styles.calLegend}>
            <span className={styles.legendItem}>
              <span className={styles.dotMoro} />
              Moros
            </span>
            <span className={styles.legendItem}>
              <span className={styles.dotCristiano} />
              Crist.
            </span>
          </div>
        </div>

        {/* Cabecera días */}
        <div className={styles.calDowRow}>
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className={styles.calDow}>{d}</div>
          ))}
        </div>

        {/* Grid de días */}
        <div className={styles.calGrid}>
          {calCells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className={styles.calEmpty} />;
            const isSel  = selectedDay === day;
            const isFest = festiveDays.has(day);
            const hasMoro  = moroDays.has(day);
            const hasCtian = ctianDays.has(day);
            const cellClass = `${styles.calCell}${isSel ? ` ${styles.selected}` : isFest ? ` ${styles.fest}` : ''}`;
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cellClass}
              >
                <span>{day}</span>
                <div className={styles.dayDots}>
                  {hasMoro  && <span className={styles.eventDotMoro} />}
                  {hasCtian && <span className={styles.eventDotCristiano} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chips de filtro ── */}
      <div className={styles.filters}>
        {filterOptions.map(f => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.chip}${active ? ` ${styles.active}` : ''}`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* ── Lista de eventos ── */}
      <div className={styles.eventList}>
        {isLoading && (
          <div className={styles.loading}>Cargando eventos…</div>
        )}
        {error && !isLoading && (
          <div className={styles.error}>No se pudieron cargar los eventos</div>
        )}
        {!isLoading && !error && filteredEvents.length === 0 && (
          <div className={styles.emptyMsg}>
            No hay eventos para este día y filtro
          </div>
        )}
        {!isLoading && filteredEvents.map(ev => (
          <EventCard
            key={ev.id}
            event={ev}
            isFavorite={!!favorites[ev.id]}
            onOpen={() => openEvent(ev)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* ── Modal de evento ── */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isFavorite={!!favorites[selectedEvent.id]}
          onClose={closeEvent}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
