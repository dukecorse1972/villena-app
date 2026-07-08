import type { FiestaEvent, EventType } from '../types';
import { festivalISODate } from '../utils/dates';

interface RawFiestaEvent {
  id: string; time: string; title: string; location: string; type: EventType;
  /** Día del mes de fiestas (4-9); se convierte a fecha ISO real en allEvents. */
  day: number;
}

// 30 eventos hardcodeados del prototipo original.
// `day` se escribe como número por comodidad de lectura/edición; allEvents
// lo convierte a fecha ISO real usando FESTIVAL.YEAR/MONTH_INDEX.
const rawEvents: RawFiestaEvent[] = [
  { id: 'e1',  time: '08:00', title: 'Diana General',                     location: 'Plaza de Santiago',    type: 'Desfiles',   day: 4 },
  { id: 'e2',  time: '12:00', title: 'Alarde de Infantería',              location: 'Av. Constitución',     type: 'Desfiles',   day: 4 },
  { id: 'e3',  time: '20:00', title: 'Misa de Campaña',                   location: 'Iglesia de Santiago',  type: 'Religiosos', day: 4 },
  { id: 'e4',  time: '23:00', title: 'Entrada Cristiana',                 location: 'Av. Constitución',     type: 'Desfiles',   day: 5 },
  { id: 'e5',  time: '11:00', title: 'Contrabando',                       location: 'Casco Antiguo',        type: 'Desfiles',   day: 6 },
  { id: 'e6',  time: '17:00', title: 'Procesión del Estandarte',          location: 'Casco Histórico',      type: 'Religiosos', day: 6 },
  { id: 'e7',  time: '23:00', title: 'Entrada Mora',                      location: 'Av. Constitución',     type: 'Desfiles',   day: 7 },
  { id: 'e8',  time: '10:00', title: 'Concierto de Bandas',               location: 'Plaza Mayor',          type: 'Música',     day: 8 },
  { id: 'e9',  time: '19:00', title: 'Festival Cultural Festero',         location: 'Centro Cultural',      type: 'Cultural',   day: 8 },
  { id: 'e10', time: '16:00', title: 'Desfile de Gala',                   location: 'Av. Constitución',     type: 'Desfiles',   day: 9 },
  { id: 'e11', time: '09:00', title: 'Diana General',                     location: 'Plaza de Santiago',    type: 'Música',     day: 5 },
  { id: 'e12', time: '11:30', title: 'Alarde de Infantería',              location: 'Paseo Chapí',          type: 'Desfiles',   day: 5 },
  { id: 'e13', time: '17:00', title: 'Entrada Cristiana',                 location: 'Av. Constitución',     type: 'Desfiles',   day: 5 },
  { id: 'e14', time: '23:00', title: 'Entrada Mora',                      location: 'Av. Constitución',     type: 'Desfiles',   day: 5 },
  { id: 'e15', time: '10:00', title: 'Misa de Campaña',                   location: 'Basílica Virgen',      type: 'Religiosos', day: 6 },
  { id: 'e16', time: '12:30', title: 'Concierto Diana Festera',           location: 'Plaza Mayor',          type: 'Música',     day: 6 },
  { id: 'e17', time: '18:00', title: 'Embajada Mora al Castillo',         location: 'Castillo Atalaya',     type: 'Cultural',   day: 6 },
  { id: 'e18', time: '22:00', title: 'Retreta de Comparsas',              location: 'Paseo Chapí',          type: 'Música',     day: 6 },
  { id: 'e19', time: '09:30', title: 'Procesión del Santísimo',           location: 'Basílica Virgen',      type: 'Religiosos', day: 7 },
  { id: 'e20', time: '11:00', title: 'Alardo de Pólvora',                location: 'Plaza de Santiago',    type: 'Desfiles',   day: 7 },
  { id: 'e21', time: '16:00', title: 'Guerrilla Festera',                location: 'Casco Antiguo',        type: 'Cultural',   day: 7 },
  { id: 'e22', time: '20:30', title: 'Concierto Bandas Festeras',        location: 'Plaza Mayor',          type: 'Música',     day: 7 },
  { id: 'e23', time: '10:00', title: 'Misa Solemne al Santísimo',        location: 'Basílica Virgen',      type: 'Religiosos', day: 8 },
  { id: 'e24', time: '13:00', title: 'Parlamento Festero',               location: 'Ayuntamiento',         type: 'Cultural',   day: 8 },
  { id: 'e25', time: '17:30', title: 'Embajada Cristiana al Castillo',   location: 'Castillo Atalaya',     type: 'Cultural',   day: 8 },
  { id: 'e26', time: '21:00', title: 'Desfile de Antorchas',             location: 'Av. Constitución',     type: 'Desfiles',   day: 8 },
  { id: 'e27', time: '10:00', title: 'Procesión de la Virgen',           location: 'Basílica Virgen',      type: 'Religiosos', day: 9 },
  { id: 'e28', time: '12:00', title: 'Guerrilla de Pólvora Final',       location: 'Plaza Mayor',          type: 'Desfiles',   day: 9 },
  { id: 'e29', time: '18:00', title: 'Recreación Histórica Conquista',   location: 'Castillo Atalaya',     type: 'Cultural',   day: 9 },
  { id: 'e30', time: '22:30', title: 'Traca Final y Fuegos Artificiales', location: 'Paseo Chapí',         type: 'Cultural',   day: 9 },
];

export const allEvents: FiestaEvent[] = rawEvents.map(({ day, ...rest }) => ({
  ...rest,
  date: festivalISODate(day),
}));

// Colores por tipo de evento
export const typeColors: Record<EventType, { bg: string; border: string; text: string }> = {
  Desfiles:   { bg: 'rgba(196,151,42,.15)',  border: 'rgba(196,151,42,.4)',  text: '#c4972a' },
  Religiosos: { bg: 'rgba(160,120,220,.15)', border: 'rgba(160,120,220,.4)', text: '#b090e0' },
  Música:     { bg: 'rgba(60,180,100,.15)',  border: 'rgba(60,180,100,.4)',  text: '#50c878' },
  Cultural:   { bg: 'rgba(60,140,220,.15)',  border: 'rgba(60,140,220,.4)',  text: '#5a9edc' },
};

// Descripciones por tipo
export const typeDescs: Record<EventType, string> = {
  Desfiles:
    'Las comparsas desfilan por las principales calles de Villena al son de las bandas de música, mostrando sus espectaculares trajes festeros. El cortejo parte desde el norte de la Avenida de la Constitución y recorre el centro histórico hasta la Plaza Mayor, con paradas y saludos ante las autoridades. Es uno de los actos más esperados y multitudinarios de las fiestas, con miles de festeros y espectadores congregados a lo largo del trayecto.',
  Religiosos:
    'Acto de devoción y fe en el que los festeros acompañan a la Virgen de las Virtudes, patrona de Villena, en un emotivo recorrido por la ciudad histórica. Las comparsas participan con total recogimiento, fusionando la celebración popular con la tradición religiosa que da sentido y origen a las fiestas. La basílica se convierte en el centro espiritual de los días grandes.',
  Música:
    'Las bandas festeras de las distintas comparsas interpretan las marchas más emblemáticas de las fiestas en un ambiente de celebración colectiva y alegría. Las dianas recorren el casco antiguo al amanecer despertando a los villeneros con el sonido inconfundible de los tambores y las trompetas, marcando el inicio de una nueva jornada festera llena de emoción.',
  Cultural:
    'Actividad cultural que pone en valor la historia y las tradiciones de las Fiestas de Moros y Cristianos de Villena, declaradas Fiesta de Interés Turístico Internacional. Una oportunidad única para conocer en profundidad el rico patrimonio festero de la ciudad, sus leyendas, sus personajes históricos y el significado de cada acto dentro del programa oficial.',
};

// Fotos por tipo (URLs de Unsplash del prototipo original)
export const typePhotos: Record<EventType, string> = {
  Desfiles:   'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=800&fit=crop&auto=format&q=90',
  Religiosos: 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=800&fit=crop&auto=format&q=90',
  Música:     'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=800&fit=crop&auto=format&q=90',
  Cultural:   'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=800&fit=crop&auto=format&q=90',
};

// Coordenadas de los lugares
export const locCoords: Record<string, [number, number]> = {
  'Plaza Mayor':         [38.6325, -0.8680],
  'Plaza de Santiago':   [38.6330, -0.8685],
  'Av. Constitución':    [38.6315, -0.8690],
  'Basílica Virgen':     [38.6320, -0.8675],
  'Castillo Atalaya':    [38.6380, -0.8650],
  'Paseo Chapí':         [38.6310, -0.8695],
  'Casco Antiguo':       [38.6335, -0.8672],
  'Centro Cultural':     [38.6318, -0.8678],
  'Ayuntamiento':        [38.6322, -0.8680],
  'Iglesia de Santiago': [38.6328, -0.8683],
  'Casco Histórico':     [38.6333, -0.8670],
};

// Días festivos y de desfiles (día del mes de fiestas, no fecha completa)
export const festiveDays = new Set([4, 5, 6, 7, 8, 9]);
export const moroDays    = new Set([5, 7, 8]);
export const ctianDays   = new Set([4, 6, 9]);
