import type { Comparsa } from '../types';

// 7 Comparsas Cristianas + 7 Comparsas Moras
// Los logos están en /public/logos/

export const comparsasCristianas: Comparsa[] = [
  { id: 'c1', name: 'Estudiantes',       color: '#1a1a1a', img: '/logos/estudiantes.png',       bando: 'Cristiano' },
  { id: 'c2', name: 'Marinos Corsarios', color: '#5a0a0a', img: '/logos/marinos-corsarios.png', bando: 'Cristiano' },
  { id: 'c3', name: 'Andaluces',         color: '#3a2210', img: '/logos/andaluces.png',          bando: 'Cristiano' },
  { id: 'c4', name: 'Maseros',           color: '#3a2a10', img: '/logos/maseros.png',            bando: 'Cristiano' },
  { id: 'c5', name: 'Ballesteros',       color: '#2a3a10', img: '/logos/ballesteros.png',        bando: 'Cristiano' },
  { id: 'c6', name: 'Almogávares',       color: '#1a3a2e', img: '/logos/almogavares.png',        bando: 'Cristiano' },
  { id: 'c7', name: 'Cristianos',        color: '#1a1a3a', img: '/logos/cristianos.png',         bando: 'Cristiano' },
];

export const comparsasMoras: Comparsa[] = [
  { id: 'm1', name: 'Moros Viejos', color: '#1a1a1a', img: '/logos/moros-viejos-v2.png', bando: 'Moro' },
  { id: 'm2', name: 'Moros Nuevos', color: '#5a0a0a', img: '/logos/moros-nuevos-v2.png', bando: 'Moro' },
  { id: 'm3', name: 'Marruecos',    color: '#1a1a1a', img: '/logos/marruecos-v2.png',    bando: 'Moro' },
  { id: 'm4', name: 'Realistas',    color: '#3a2210', img: '/logos/realistas-v2.png',    bando: 'Moro' },
  { id: 'm5', name: 'Nazaríes',     color: '#5a0a0a', img: '/logos/nazaries-v2.png',     bando: 'Moro' },
  { id: 'm6', name: 'Bereberes',    color: '#2a1800', img: '/logos/bereberes-v2.png',    bando: 'Moro' },
  { id: 'm7', name: 'Piratas',      color: '#1a0808', img: '/logos/piratas-v2.png',      bando: 'Moro' },
];

export const allComparsas: Comparsa[] = [...comparsasCristianas, ...comparsasMoras];
