// ── Tipos de base de datos Supabase ──────────────────────────────────────────
//
// Generado automáticamente desde el esquema real del proyecto (project ref
// fzetusdxlbghtykuudnl) con:
//   npx supabase gen types typescript --project-id fzetusdxlbghtykuudnl \
//     > src/types/database.ts
//
// No editar a mano — cualquier cambio de esquema (nueva columna, tabla o
// relación) debe pasar por una migración en supabase/migrations/ y luego
// regenerar este fichero con el comando de arriba.
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avisos: {
        Row: {
          created_at: string
          id: string
          is_new: boolean
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_new?: boolean
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_new?: boolean
          text?: string
        }
        Relationships: []
      }
      cargos: {
        Row: {
          comparsa_id: string
          created_at: string
          id: string
          person_name: string
          photo_url: string | null
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          comparsa_id: string
          created_at?: string
          id?: string
          person_name: string
          photo_url?: string | null
          role: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          comparsa_id?: string
          created_at?: string
          id?: string
          person_name?: string
          photo_url?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargos_comparsa_id_fkey"
            columns: ["comparsa_id"]
            isOneToOne: false
            referencedRelation: "comparsas"
            referencedColumns: ["id"]
          },
        ]
      }
      comparsas: {
        Row: {
          bando: Database["public"]["Enums"]["comparsa_bando"]
          color: string
          created_at: string
          description: string | null
          desfile_img_url: string | null
          estandarte_img_url: string | null
          founded_year: number | null
          id: string
          img_url: string | null
          name: string
          num_socios: number | null
          traje_gala_img_url: string | null
          updated_at: string
        }
        Insert: {
          bando: Database["public"]["Enums"]["comparsa_bando"]
          color?: string
          created_at?: string
          description?: string | null
          desfile_img_url?: string | null
          estandarte_img_url?: string | null
          founded_year?: number | null
          id: string
          img_url?: string | null
          name: string
          num_socios?: number | null
          traje_gala_img_url?: string | null
          updated_at?: string
        }
        Update: {
          bando?: Database["public"]["Enums"]["comparsa_bando"]
          color?: string
          created_at?: string
          description?: string | null
          desfile_img_url?: string | null
          estandarte_img_url?: string | null
          founded_year?: number | null
          id?: string
          img_url?: string | null
          name?: string
          num_socios?: number | null
          traje_gala_img_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          img_url: string | null
          location: string
          ruta_id: string | null
          time: string
          title: string
          type: Database["public"]["Enums"]["evento_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id: string
          img_url?: string | null
          location: string
          ruta_id?: string | null
          time: string
          title: string
          type: Database["public"]["Enums"]["evento_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          img_url?: string | null
          location?: string
          ruta_id?: string | null
          time?: string
          title?: string
          type?: Database["public"]["Enums"]["evento_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string
          evento_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evento_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          evento_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      pois: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string
          id: string
          lat: number
          lng: number
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string
          id: string
          lat: number
          lng: number
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          platform: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          platform: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          platform?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rutas: {
        Row: {
          created_at: string
          id: string
          name: string
          path: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          path: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          path?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      comparsa_bando: "Cristiano" | "Moro"
      evento_type: "Desfiles" | "Religiosos" | "Música" | "Cultural"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      comparsa_bando: ["Cristiano", "Moro"],
      evento_type: ["Desfiles", "Religiosos", "Música", "Cultural"],
    },
  },
} as const
