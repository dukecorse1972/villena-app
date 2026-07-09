import { describe, it, expect, beforeAll } from 'vitest';
import { festivalISODate, dayOfMonth, weekdayShortLabel, daysInMonth, firstWeekdayOffset, festivalTodayDay } from './dates';
import { FESTIVAL } from '../constants';
import i18n from '../i18n';

describe('festivalISODate', () => {
  it('construye la fecha ISO con el año y mes del festival', () => {
    expect(festivalISODate(4)).toBe(`${FESTIVAL.YEAR}-09-04`);
  });

  it('rellena con ceros los días de un solo dígito', () => {
    expect(festivalISODate(9)).toBe(`${FESTIVAL.YEAR}-09-09`);
  });
});

describe('dayOfMonth', () => {
  it('extrae el día de una fecha ISO', () => {
    expect(dayOfMonth('2026-09-04')).toBe(4);
  });
});

describe('weekdayShortLabel', () => {
  // weekdayShortLabel depende del idioma activo (i18next); se fija a
  // español para que el test sea determinista independientemente del
  // idioma detectado por defecto en el entorno de test.
  beforeAll(async () => {
    await i18n.changeLanguage('es');
  });

  it('el 1 de septiembre de 2026 es martes', () => {
    expect(weekdayShortLabel('2026-09-01')).toBe('Mar');
  });

  it('el 4 de septiembre de 2026 es viernes', () => {
    expect(weekdayShortLabel('2026-09-04')).toBe('Vie');
  });
});

describe('daysInMonth', () => {
  it('septiembre tiene 30 días', () => {
    expect(daysInMonth(2026, 9)).toBe(30);
  });

  it('febrero de un año bisiesto tiene 29 días', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });
});

describe('firstWeekdayOffset', () => {
  it('septiembre de 2026 empieza en martes → 1 celda vacía', () => {
    expect(firstWeekdayOffset(2026, 9)).toBe(1);
  });

  it('un mes que empieza en lunes no tiene celdas vacías', () => {
    // Junio de 2026 empieza en lunes
    expect(firstWeekdayOffset(2026, 6)).toBe(0);
  });

  it('un mes que empieza en domingo tiene 6 celdas vacías', () => {
    // Noviembre de 2026 empieza en domingo
    expect(firstWeekdayOffset(2026, 11)).toBe(6);
  });
});

describe('festivalTodayDay', () => {
  it('si hoy cae dentro del mes de fiestas, devuelve el día real', () => {
    const hoy = new Date(FESTIVAL.YEAR, FESTIVAL.MONTH_INDEX - 1, 6); // 6 de septiembre
    expect(festivalTodayDay(hoy)).toBe(6);
  });

  it('si hoy es antes de las fiestas (ej. julio), devuelve el primer día del programa', () => {
    const hoy = new Date(FESTIVAL.YEAR, 6, 8); // 8 de julio
    expect(festivalTodayDay(hoy)).toBe(FESTIVAL.START_DAY);
  });

  it('si hoy es después de septiembre, devuelve el primer día del programa', () => {
    const hoy = new Date(FESTIVAL.YEAR, FESTIVAL.MONTH_INDEX, 15); // octubre
    expect(festivalTodayDay(hoy)).toBe(FESTIVAL.START_DAY);
  });

  it('si es septiembre pero de otro año, devuelve el primer día del programa', () => {
    const hoy = new Date(FESTIVAL.YEAR - 1, FESTIVAL.MONTH_INDEX - 1, 6);
    expect(festivalTodayDay(hoy)).toBe(FESTIVAL.START_DAY);
  });
});
