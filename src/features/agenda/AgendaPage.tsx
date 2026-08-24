import { useTranslation } from 'react-i18next';
import { useAgenda } from './useAgenda';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { festiveDays, moroDays, ctianDays } from '../../data/events';
import { FESTIVAL } from '../../constants';
import { daysInMonth, firstWeekdayOffset } from '../../utils/dates';
import { onActivateKey } from '../../utils/a11y';
import { triggerSelectionHaptic } from '../../utils/haptics';
import styles from './AgendaPage.module.css';

// Claves de traducción de agenda.filters — deben coincidir con los valores
// literales de la columna `type` en BD (ver eventsService.filterEventsByDayAndType).
const FILTER_KEYS: Record<string, string> = {
  Todos: 'todos',
  Desfiles: 'desfiles',
  Religiosos: 'religiosos',
  Música: 'musica',
  Cultural: 'cultural',
};

export default function AgendaPage() {
  const { t } = useTranslation();
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

  // Generar celdas del calendario a partir del año/mes del festival, en vez
  // de un offset y un número de días fijados a mano cada edición.
  const offset      = firstWeekdayOffset(FESTIVAL.YEAR, FESTIVAL.MONTH_INDEX);
  const totalDays   = daysInMonth(FESTIVAL.YEAR, FESTIVAL.MONTH_INDEX);
  const calCells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) calCells.push(null);
  for (let d = 1; d <= totalDays; d++) calCells.push(d);
  while (calCells.length % 7 !== 0) calCells.push(null);

  return (
    <div className={styles.page}>
      {/* ── Título ── */}
      <div className={styles.titleBar}>
        <h1>{t('agenda.title')}</h1>
      </div>

      {/* ── Calendario ── */}
      <div className={styles.calendar}>
        {/* Cabecera mes + leyenda */}
        <div className={styles.calHeader}>
          <span className={styles.calMonth}>{FESTIVAL.MONTH.toUpperCase()} {FESTIVAL.YEAR}</span>
          <div className={styles.calLegend}>
            <span className={styles.legendItem}>
              <span className={styles.dotMoro} />
              {t('agenda.legendMoros')}
            </span>
            <span className={styles.legendItem}>
              <span className={styles.dotCristiano} />
              {t('agenda.legendCristianos')}
            </span>
          </div>
        </div>

        {/* Cabecera días */}
        <div className={styles.calDowRow}>
          {(t('agenda.calendarWeekdays', { returnObjects: true }) as string[]).map(d => (
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
                onClick={() => {
                  triggerSelectionHaptic();
                  setSelectedDay(day);
                }}
                onKeyDown={onActivateKey(() => {
                  triggerSelectionHaptic();
                  setSelectedDay(day);
                })}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={t('agenda.diaLabel', { day })}
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
              onClick={() => {
                triggerSelectionHaptic();
                setFilter(f);
              }}
              className={`${styles.chip}${active ? ` ${styles.active}` : ''}`}
            >
              {t(`agenda.filters.${FILTER_KEYS[f]}`)}
            </button>
          );
        })}
      </div>

      {/* ── Lista de eventos ── */}
      <div className={styles.eventList}>
        {isLoading && (
          <div className={styles.loading}>{t('agenda.loading')}</div>
        )}
        {error && !isLoading && (
          <div className={styles.error}>{t('agenda.error')}</div>
        )}
        {!isLoading && !error && filteredEvents.length === 0 && (
          <div className={styles.emptyMsg}>
            {t('agenda.empty')}
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
