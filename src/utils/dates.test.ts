import { describe, it, expect } from 'vitest';
import { festivalISODate, dayOfMonth, weekdayShortLabel, daysInMonth, firstWeekdayOffset } from './dates';
import { FESTIVAL } from '../constants';

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
