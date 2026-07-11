import { supabase, isSupabaseConfigured } from './supabase';
import { unwrapList } from './serviceHelpers';
import type { PointOfInterest } from '../types';

/** POIs hardcodeados como fallback cuando Supabase no está disponible */
const LOCAL_POIS: PointOfInterest[] = [
  { id: 'poi1', name: 'Castillo de la Atalaya',        description: 'Castillo medieval símbolo de Villena',                 lat: 38.6374, lng: -0.8659, category: 'Monumentos',   icon: '🏰' },
  { id: 'poi2', name: 'Basílica de Santiago',          description: 'Iglesia principal y sede de los actos religiosos',      lat: 38.6341, lng: -0.8643, category: 'Religiosos',    icon: '⛪' },
  { id: 'poi3', name: 'Plaza Mayor',                   description: 'Centro neurálgico de los desfiles festeros',            lat: 38.6338, lng: -0.8641, category: 'Plazas',        icon: '🏛️' },
  { id: 'poi4', name: 'Avenida Constitución',          description: 'Escenario principal de Entradas Moras y Cristianas',    lat: 38.6355, lng: -0.8650, category: 'Desfiles',      icon: '🎭' },
  { id: 'poi5', name: 'Museo Arqueológico José María García Guardiola', description: 'Tesoro de Villena y hallazgos íberos', lat: 38.6336, lng: -0.8638, category: 'Museos',       icon: '🏺' },
  { id: 'poi6', name: 'Ermita de la Virgen de las Virtudes', description: 'Patrona de Villena, destino de la procesión',   lat: 38.6289, lng: -0.8712, category: 'Religiosos',    icon: '⛪' },
  { id: 'poi7', name: 'Casa de Cultura',               description: 'Sede de exposiciones y actos culturales festeros',      lat: 38.6340, lng: -0.8647, category: 'Cultural',      icon: '🎨' },
  { id: 'poi8', name: 'Punto de Información Festera', description: 'Mapas, programas y atención al visitante',              lat: 38.6342, lng: -0.8640, category: 'Servicios',     icon: 'ℹ️' },
  { id: 'poi9', name: 'Zona de Primeros Auxilios',     description: 'Asistencia sanitaria durante las fiestas',             lat: 38.6344, lng: -0.8648, category: 'Servicios',     icon: '🏥' },

  // Locales sociales de las comparsas (direcciones reales, ver migración
  // 013_locales_comparsas_pois.sql) — el acto "Cena de confraternidad
  // festera" ocurre en "Locales de las comparsas", uno por comparsa, no
  // en un único punto.
  { id: 'poi-local-estudiantes', name: 'Estudiantes',      description: 'Local social — Plaza Las Malvas, 5 (La Troyica)',              lat: 38.6334, lng: -0.8669, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-marinos',     name: 'Marinos Corsarios', description: 'Local social — La Tercia, 1',                                  lat: 38.6303, lng: -0.8603, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-andaluces',   name: 'Andaluces',         description: 'Local social — Maestro Moltó, 14',                             lat: 38.6325, lng: -0.8622, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-maseros',     name: 'Maseros',           description: 'Local social — Plaza de Santa María, 14',                      lat: 38.6304, lng: -0.8615, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-ballesteros', name: 'Ballesteros',       description: 'Local social — Maestro Moltó, 11',                             lat: 38.6330, lng: -0.8608, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-almogavares', name: 'Almogávares',       description: 'Local social — San Cristóbal, 33',                             lat: 38.6348, lng: -0.8674, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-cristianos',  name: 'Cristianos',        description: 'Local social — Plaza Mayor, 12',                               lat: 38.6302, lng: -0.8623, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-moros-viejos',name: 'Moros Viejos',      description: 'Local social — C/ Parrales, 10',                               lat: 38.6347, lng: -0.8663, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-moros-nuevos',name: 'Moros Nuevos',      description: 'Local social — C/ Teniente Hernández Menor, 16 (La Jaima)',    lat: 38.6307, lng: -0.8624, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-marruecos',   name: 'Marruecos',         description: 'Local social — C/ Ferriz, 8',                                  lat: 38.6291, lng: -0.8645, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-realistas',   name: 'Realistas',         description: 'Local social — C/ San Benito, 1',                              lat: 38.6294, lng: -0.8624, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-nazaries',    name: 'Nazaríes',          description: 'Local social — C/ La Tercia, 7',                               lat: 38.6305, lng: -0.8601, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-bereberes',   name: 'Bereberes',         description: 'Local social — C/ Congregación, 3',                            lat: 38.6332, lng: -0.8672, category: 'Local de comparsa', icon: '🏠' },
  { id: 'poi-local-piratas',     name: 'Piratas',           description: 'Local social — C/ Ferriz, 6 (La Guarida)',                     lat: 38.6293, lng: -0.8643, category: 'Local de comparsa', icon: '🏠' },
];

/**
 * Devuelve todos los puntos de interés.
 * Si Supabase está configurado, consulta la BD; si no, usa datos locales.
 */
export async function getPois(): Promise<PointOfInterest[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('pois')
      .select('*')
      .order('name');

    return unwrapList({ data, error }) as PointOfInterest[];
  }

  return LOCAL_POIS;
}
