// Tipos del esquema de PostgreSQL.
// Archivo PROVISIONAL escrito a mano para el andamiaje: reemplázalo con
// npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          sku: string
          stock: number
          recycled_percentage: number
          carbon_footprint_kg: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sku: string
          stock?: number
          recycled_percentage?: number
          carbon_footprint_kg?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          stock?: number
          recycled_percentage?: number
          carbon_footprint_kg?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
