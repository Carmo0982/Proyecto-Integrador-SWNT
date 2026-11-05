import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Cliente único de Supabase. Es `null` cuando no hay variables de entorno:
 * en ese caso la app usa el repositorio simulado (ver services/emissionsRepository.ts).
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
