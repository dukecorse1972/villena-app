import { supabase, isSupabaseConfigured } from './supabase';
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

    if (error) throw new Error(error.message);
    return (data ?? []) as PointOfInterest[];
  }

  return LOCAL_POIS;
}
