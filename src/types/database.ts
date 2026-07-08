// ── Tipos de base de datos Supabase ──────────────────────────────────────────
//
// Este fichero se puede regenerar automáticamente con:
//   npx supabase gen types typescript --project-id TU_PROJECT_ID \
//     > src/types/database.ts
//
// Por ahora es una versión manual sincronizada con 001_schema.sql.
// ─────────────────────────────────────────────────────────────────────────────

type EventType = 'Desfiles' | 'Religiosos' | 'Música' | 'Cultural';
type Bando     = 'Cristiano' | 'Moro';

export interface Database {
  public: {
    Tables: {
      eventos: {
        Row: {
          id:          string;
          title:       string;
          time:        string;
          location:    string;
          type:        EventType;
          date:        string; // 'YYYY-MM-DD'
          img_url:     string | null;
          description: string | null;
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id:          string;
          title:       string;
          time:        string;
          location:    string;
          type:        EventType;
          date:        string;
          img_url?:    string | null;
          description?: string | null;
        };
        Update: Partial<Database['public']['Tables']['eventos']['Insert']>;
      };

      comparsas: {
        Row: {
          id:                  string;
          name:                string;
          bando:               Bando;
          color:               string;
          img_url:             string | null;
          description:         string | null;
          founded_year:        number | null;
          num_socios:          number | null;
          desfile_img_url:     string | null;
          traje_gala_img_url:  string | null;
          estandarte_img_url:  string | null;
          created_at:          string;
          updated_at:          string;
        };
        Insert: {
          id:                   string;
          name:                 string;
          bando:                Bando;
          color?:               string;
          img_url?:             string | null;
          description?:         string | null;
          founded_year?:        number | null;
          num_socios?:          number | null;
          desfile_img_url?:     string | null;
          traje_gala_img_url?:  string | null;
          estandarte_img_url?:  string | null;
        };
        Update: Partial<Database['public']['Tables']['comparsas']['Insert']>;
      };

      avisos: {
        Row: {
          id:         string;
          text:       string;
          is_new:     boolean;
          created_at: string;
        };
        Insert: {
          text:    string;
          is_new?: boolean;
        };
        Update: Partial<Database['public']['Tables']['avisos']['Insert']>;
      };

      pois: {
        Row: {
          id:          string;
          name:        string;
          description: string | null;
          lat:         number;
          lng:         number;
          category:    string;
          icon:        string;
          created_at:  string;
        };
        Insert: {
          id:           string;
          name:         string;
          description?: string | null;
          lat:          number;
          lng:          number;
          category:     string;
          icon?:        string;
        };
        Update: Partial<Database['public']['Tables']['pois']['Insert']>;
      };

      favoritos: {
        Row: {
          user_id:    string;
          evento_id:  string;
          created_at: string;
        };
        Insert: {
          user_id:   string;
          evento_id: string;
        };
        Update: {
          user_id?:   string;
          evento_id?: string;
        };
      };

      admins: {
        Row: {
          user_id:    string;
          created_at: string;
        };
        Insert: {
          user_id: string;
        };
        Update: {
          user_id?: string;
        };
      };

      cargos: {
        Row: {
          id:          string;
          comparsa_id: string;
          role:        string;
          person_name: string;
          photo_url:   string | null;
          sort_order:  number;
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id?:          string;
          comparsa_id:  string;
          role:         string;
          person_name:  string;
          photo_url?:   string | null;
          sort_order?:  number;
        };
        Update: Partial<Database['public']['Tables']['cargos']['Insert']>;
      };

      push_tokens: {
        Row: {
          token:      string;
          user_id:    string | null;
          platform:   'android' | 'ios';
          created_at: string;
        };
        Insert: {
          token:     string;
          user_id?:  string | null;
          platform:  'android' | 'ios';
        };
        Update: Partial<Database['public']['Tables']['push_tokens']['Insert']>;
      };
    };
  };
}
