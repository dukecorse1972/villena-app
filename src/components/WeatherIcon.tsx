import type { WeatherCondition } from '../services/weatherService';

interface WeatherIconProps {
  condition: WeatherCondition | null;
  size?: number;
}

const STROKE = 'rgba(196,151,42,.7)';

/** Icono de tiempo según la condición del cielo devuelta por AEMET. */
export default function WeatherIcon({ condition, size = 12 }: WeatherIconProps) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: STROKE, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (condition) {
    case 'despejado':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
      );
    case 'poco-nuboso':
      return (
        <svg {...props}>
          <circle cx="9" cy="10" r="3.5" />
          <path d="M15.5 20H8a4 4 0 1 1 .5-7.97A5 5 0 0 1 18 14a3 3 0 0 1-2.5 6z" />
        </svg>
      );
    case 'nuboso':
    case 'cubierto':
      return (
        <svg {...props}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
        </svg>
      );
    case 'lluvia':
    case 'chubascos':
      return (
        <svg {...props}>
          <path d="M16.5 15H8a6 6 0 1 1 5.71-7.8h1.29a4 4 0 1 1 1.5 7.7z" />
          <path d="M9 19l-1 2M13 19l-1 2M17 19l-1 2" />
        </svg>
      );
    case 'tormenta':
      return (
        <svg {...props}>
          <path d="M16.5 13H8a6 6 0 1 1 5.71-7.8h1.29a4 4 0 1 1 1.5 7.7z" />
          <path d="M13 14l-3 5h3l-2 4" />
        </svg>
      );
    case 'nieve':
      return (
        <svg {...props}>
          <path d="M16.5 13H8a6 6 0 1 1 5.71-7.8h1.29a4 4 0 1 1 1.5 7.7z" />
          <path d="M9 18v4M7 19.5l4 2M11 19.5l-4 2M15 18v4M13 19.5l4 2M17 19.5l-4 2" />
        </svg>
      );
    case 'niebla':
      return (
        <svg {...props}>
          <path d="M4 9h12M2.5 13h16M4 17h12M18.5 13h3" />
        </svg>
      );
    default:
      // Sin condición conocida: icono neutro de nube (comportamiento previo).
      return (
        <svg {...props}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
        </svg>
      );
  }
}
