import { FESTIVAL } from '../constants';
import i18n from '../i18n';

/**
 * Convierte un día del mes de fiestas (p.ej. 4) en su fecha ISO completa
 * (p.ej. '2026-09-04'), usando el año y mes configurados en FESTIVAL.
 */
export function festivalISODate(day: number): string {
  return `${FESTIVAL.YEAR}-${String(FESTIVAL.MONTH_INDEX).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Extrae el día del mes (1-31) de una fecha ISO 'YYYY-MM-DD'. */
export function dayOfMonth(isoDate: string): number {
  return Number(isoDate.slice(8, 10));
}

/** Devuelve la abreviatura del día de la semana (Lun, Mar...) de una fecha ISO, en el idioma activo. */
export function weekdayShortLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const weekdaysShort = i18n.t('dates.weekdaysShort', { returnObjects: true }) as string[];
  return weekdaysShort[new Date(y, m - 1, d).getDay()];
}

/** Número de días que tiene un mes concreto (1-12) de un año dado. */
export function daysInMonth(year: number, monthIndex1: number): number {
  return new Date(year, monthIndex1, 0).getDate();
}

/**
 * Nº de celdas vacías necesarias al principio de un calendario que empieza
 * en lunes, para que el día 1 del mes caiga en la columna correcta.
 * (0 = el mes empieza en lunes, 6 = el mes empieza en domingo)
 */
export function firstWeekdayOffset(year: number, monthIndex1: number): number {
  const jsDay = new Date(year, monthIndex1 - 1, 1).getDay(); // 0=domingo..6=sábado
  return jsDay === 0 ? 6 : jsDay - 1; // convertido a lunes=0..domingo=6
}

/**
 * Día del mes de fiestas que debería estar seleccionado "hoy" en la Agenda.
 * Si la fecha real cae dentro del mes/año del festival, devuelve ese día.
 * Si no (antes o después de las fiestas, o de otro año), devuelve el primer
 * día del programa (FESTIVAL.START_DAY) — no tiene sentido "seleccionar hoy"
 * cuando hoy no es un día de fiestas.
 */
export function festivalTodayDay(now: Date = new Date()): number {
  const isFestivalMonth = now.getFullYear() === FESTIVAL.YEAR && now.getMonth() + 1 === FESTIVAL.MONTH_INDEX;
  return isFestivalMonth ? now.getDate() : FESTIVAL.START_DAY;
}
