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

// Orden de desfile (16 comparsas, del prototipo original)
export const paradeOrder: { pos: number; name: string; side: 'C' | 'M' }[] = [
  { pos:  1, name: 'Labradores',   side: 'C' },
  { pos:  2, name: 'Marruecos',    side: 'M' },
  { pos:  3, name: 'Estudiantes',  side: 'C' },
  { pos:  4, name: 'Bereberes',    side: 'M' },
  { pos:  5, name: 'Piratas',      side: 'C' },
  { pos:  6, name: 'Almogávares',  side: 'M' },
  { pos:  7, name: 'Andaluces',    side: 'C' },
  { pos:  8, name: 'Abencerrajes', side: 'M' },
  { pos:  9, name: 'Marinos',      side: 'C' },
  { pos: 10, name: 'Mudéjares',    side: 'M' },
  { pos: 11, name: 'Vizcaínos',    side: 'C' },
  { pos: 12, name: 'Guzmanes',     side: 'M' },
  { pos: 13, name: 'Alféreces',    side: 'C' },
  { pos: 14, name: 'Benimerines',  side: 'M' },
  { pos: 15, name: 'Asturianos',   side: 'C' },
  { pos: 16, name: 'Negros',       side: 'M' },
];

// Cargos del año
export const cargos: { title: string; person: string; comparsa: string; bg: string }[] = [
  { title: 'Capitán Moro',      person: 'Ahmed Al-Rashid Villarreal',  comparsa: 'Marruecos',   bg: '#7a1a1a' },
  { title: 'Capitán Cristiano', person: 'Juan Antonio García Pérez',   comparsa: 'Labradores',  bg: '#6B4C2A' },
  { title: 'Reina de Fiestas',  person: 'María Dolores Sánchez López', comparsa: 'JCF Villena', bg: '#8a6010' },
  { title: 'Embajadora Mora',   person: 'Fátima Hassan Al-Rashid',     comparsa: 'Marruecos',   bg: '#4a1a1a' },
];
