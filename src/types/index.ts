// ── Modelos de dominio ────────────────────────────────────────────────────────

export type EventType = 'Desfiles' | 'Religiosos' | 'Música' | 'Cultural';
export type Bando = 'Cristiano' | 'Moro';
export type TabId = 'inicio' | 'agenda' | 'comparsas' | 'musica' | 'info';
export type InfoView = 'servicios' | 'avisos' | null;

export interface FiestaEvent {
  id: string;
  /** Fecha ISO completa ('YYYY-MM-DD'), no solo el día del mes. */
  date: string;
  time: string;
  title: string;
  location: string;
  type: EventType;
  // Campos opcionales presentes en Supabase pero no en los datos locales
  img_url?: string;
  description?: string;
}

export interface Comparsa {
  id: string;
  name: string;
  color: string;
  img: string;
  bando: Bando;
  // Campos opcionales presentes en Supabase pero no en los datos locales
  description?: string;
  founded_year?: number;
  num_socios?: number;
}

export interface Aviso {
  id: string;
  text: string;
  is_new: boolean;
  created_at: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  category: string;
  icon: string;
}

export interface Marcha {
  title: string;
  author: string;
  year: string;
}

export interface Cargo {
  id: string;
  comparsa_id: string;
  role: string;
  person_name: string;
  photo_url?: string;
  sort_order: number;
}

export type Favorites = Record<string, boolean>;
