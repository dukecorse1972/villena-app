import { FESTIVAL } from '../constants';

const WEEKDAY_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

/** Devuelve la abreviatura del día de la semana en español (Lun, Mar...) de una fecha ISO. */
export function weekdayShortLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return WEEKDAY_SHORT_ES[new Date(y, m - 1, d).getDay()];
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
