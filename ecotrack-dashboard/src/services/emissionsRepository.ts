import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { isEmissionCategory, type Emission, type NewEmission } from '../types/emission'

/**
 * Contrato de acceso a datos. El hook depende de esta interfaz, no de Supabase,
 * lo que permite usar datos simulados en la demo y en las pruebas.
 */
export interface EmissionsRepository {
  readonly mode: 'supabase' | 'simulado'
  list(): Promise<Emission[]>
  create(input: NewEmission): Promise<Emission>
  /** Notifica inserciones hechas por cualquier cliente. Devuelve la función para cancelar. */
  subscribe(onInsert: (emission: Emission) => void): () => void
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

/** Fila tal como existe en PostgreSQL (snake_case). */
interface EmissionRow {
  id: string
  nombre_fuente: string
  categoria: string
  co2_kg: number | string
  medido_en: string
}

const TABLE = 'emisiones'
const COLUMNS = 'id, nombre_fuente, categoria, co2_kg, medido_en'

function toEmission(row: EmissionRow): Emission {
  if (!isEmissionCategory(row.categoria)) {
    throw new Error(`Categoría desconocida recibida de la base de datos: "${row.categoria}"`)
  }
  return {
    id: row.id,
    sourceName: row.nombre_fuente,
    category: row.categoria,
    co2Kg: Number(row.co2_kg),
    measuredAt: row.medido_en,
  }
}

export function createSupabaseRepository(client: SupabaseClient): EmissionsRepository {
  return {
    mode: 'supabase',

    async list() {
      const { data, error } = await client
        .from(TABLE)
        .select(COLUMNS)
        .order('medido_en', { ascending: false })
        .returns<EmissionRow[]>()
      if (error) throw new Error(`No se pudieron cargar las mediciones: ${error.message}`)
      return data.map(toEmission)
    },

    async create(input) {
      const { data, error } = await client
        .from(TABLE)
        .insert({ nombre_fuente: input.sourceName, categoria: input.category, co2_kg: input.co2Kg })
        .select(COLUMNS)
        .single<EmissionRow>()
      if (error) throw new Error(`No se pudo registrar la medición: ${error.message}`)
      return toEmission(data)
    },

    subscribe(onInsert) {
      const channel = client
        .channel('emisiones-tiempo-real')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (payload) => {
          try {
            onInsert(toEmission(payload.new as EmissionRow))
          } catch {
            // Fila inválida: se ignora para no romper la suscripción.
          }
        })
        .subscribe()
      return () => {
        void client.removeChannel(channel)
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Simulado (sin backend): misma interfaz, latencia artificial y fallos opcionales
// ---------------------------------------------------------------------------

export interface MockOptions {
  latencyMs?: number
  seed?: Emission[]
  failList?: boolean
  failCreate?: boolean
  /** Si es > 0, emite una medición nueva cada N ms (simula sensores en tiempo real). */
  autoFeedMs?: number
}

const SEED: Emission[] = [
  { id: 's-1', sourceName: 'Flota de camiones de reparto', category: 'transporte', co2Kg: 1840.5, measuredAt: '2026-11-04T13:10:00Z' },
  { id: 's-2', sourceName: 'Planta de producción Norte', category: 'energia', co2Kg: 3260, measuredAt: '2026-11-04T12:00:00Z' },
  { id: 's-3', sourceName: 'Relleno sanitario de oficinas', category: 'residuos', co2Kg: 412.75, measuredAt: '2026-11-03T20:30:00Z' },
  { id: 's-4', sourceName: 'Vuelos corporativos BOG–MDE', category: 'transporte', co2Kg: 965.2, measuredAt: '2026-11-03T15:45:00Z' },
  { id: 's-5', sourceName: 'Centro de datos (climatización)', category: 'energia', co2Kg: 1520, measuredAt: '2026-11-02T09:00:00Z' },
]

const FEED_SOURCES: NewEmission[] = [
  { sourceName: 'Sensor caldera B', category: 'energia', co2Kg: 74.3 },
  { sourceName: 'Montacargas eléctricos', category: 'energia', co2Kg: 18.9 },
  { sourceName: 'Ruta de recolección 7', category: 'residuos', co2Kg: 56.1 },
  { sourceName: 'Camión refrigerado 12', category: 'transporte', co2Kg: 132.4 },
]

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function createMockRepository(options: MockOptions = {}): EmissionsRepository {
  const { latencyMs = 700, seed = SEED, failList = false, failCreate = false, autoFeedMs = 0 } = options
  let rows = [...seed]
  let counter = 0
  const listeners = new Set<(emission: Emission) => void>()
  let feedTimer: ReturnType<typeof setInterval> | undefined

  const insert = (input: NewEmission): Emission => {
    counter += 1
    const emission: Emission = { ...input, id: `m-${Date.now()}-${counter}`, measuredAt: new Date().toISOString() }
    rows = [emission, ...rows]
    // Igual que Supabase Realtime: también se notifica al cliente que hizo la inserción.
    listeners.forEach((listener) => listener(emission))
    return emission
  }

  return {
    mode: 'simulado',

    async list() {
      await wait(latencyMs)
      if (failList) throw new Error('No se pudieron cargar las mediciones: el servidor no respondió (simulado).')
      return [...rows]
    },

    async create(input) {
      await wait(latencyMs)
      if (failCreate) throw new Error('No se pudo registrar la medición: permiso denegado por RLS (simulado).')
      return insert(input)
    },

    subscribe(onInsert) {
      listeners.add(onInsert)
      if (autoFeedMs > 0 && !feedTimer) {
        feedTimer = setInterval(() => {
          const next = FEED_SOURCES[counter % FEED_SOURCES.length]
          if (next) insert(next)
        }, autoFeedMs)
      }
      return () => {
        listeners.delete(onInsert)
        if (listeners.size === 0 && feedTimer) {
          clearInterval(feedTimer)
          feedTimer = undefined
        }
      }
    },
  }
}

/**
 * Repositorio por defecto: Supabase si hay credenciales; si no, datos simulados.
 * En modo simulado, `?simular=error-carga` o `?simular=error-insercion` en la URL fuerza los estados de error.
 */
function createDefaultRepository(): EmissionsRepository {
  if (supabase) return createSupabaseRepository(supabase)
  const simulate = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('simular')
  return createMockRepository({
    failList: simulate === 'error-carga',
    failCreate: simulate === 'error-insercion',
    autoFeedMs: simulate === 'sin-tiempo-real' ? 0 : 15_000,
  })
}

export const emissionsRepository: EmissionsRepository = createDefaultRepository()
