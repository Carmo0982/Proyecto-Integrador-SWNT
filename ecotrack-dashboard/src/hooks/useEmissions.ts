import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { emissionsRepository, type EmissionsRepository } from '../services/emissionsRepository'
import { EMISSION_CATEGORIES, type Emission, type EmissionCategory, type NewEmission } from '../types/emission'

export type LoadStatus = 'loading' | 'success' | 'error'

interface State {
  status: LoadStatus
  emissions: Emission[]
  loadError: string | null
  isSubmitting: boolean
  submitError: string | null
}

type Action =
  | { type: 'load/start' }
  | { type: 'load/success'; emissions: Emission[] }
  | { type: 'load/error'; error: string }
  | { type: 'add/start' }
  | { type: 'add/success'; emission: Emission }
  | { type: 'add/error'; error: string }
  | { type: 'realtime/insert'; emission: Emission }
  | { type: 'submitError/clear' }

export interface EmissionTotals {
  total: number
  byCategory: Record<EmissionCategory, number>
}

const initialState: State = {
  status: 'loading',
  emissions: [],
  loadError: null,
  isSubmitting: false,
  submitError: null,
}

/** Inserta sin duplicar: la misma fila puede llegar por la respuesta del INSERT y por Realtime. */
function upsert(list: Emission[], emission: Emission): Emission[] {
  if (list.some((item) => item.id === emission.id)) return list
  return [emission, ...list]
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load/start':
      return { ...state, status: 'loading', loadError: null }
    case 'load/success':
      return { ...state, status: 'success', emissions: action.emissions }
    case 'load/error':
      return { ...state, status: 'error', loadError: action.error }
    case 'add/start':
      return { ...state, isSubmitting: true, submitError: null }
    case 'add/success':
      return { ...state, isSubmitting: false, emissions: upsert(state.emissions, action.emission) }
    case 'add/error':
      return { ...state, isSubmitting: false, submitError: action.error }
    case 'realtime/insert': {
      const emissions = upsert(state.emissions, action.emission)
      return emissions === state.emissions ? state : { ...state, emissions }
    }
    case 'submitError/clear':
      return state.submitError === null ? state : { ...state, submitError: null }
  }
}

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.'

/**
 * Gestiona las mediciones de emisiones: carga inicial, inserción, errores y
 * actualizaciones en tiempo real. La UI nunca habla con Supabase directamente.
 *
 * @param repository Fuente de datos. Debe ser estable (definida fuera del componente).
 */
export function useEmissions(repository: EmissionsRepository = emissionsRepository) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [reloadKey, bumpReloadKey] = useReducer((key: number) => key + 1, 0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Carga (y recarga). `cancelled` evita actualizar el estado con respuestas viejas.
  useEffect(() => {
    let cancelled = false
    repository
      .list()
      .then((emissions) => {
        if (!cancelled) dispatch({ type: 'load/success', emissions })
      })
      .catch((error: unknown) => {
        if (!cancelled) dispatch({ type: 'load/error', error: toMessage(error) })
      })
    return () => {
      cancelled = true
    }
  }, [repository, reloadKey])

  // Tiempo real: nuevas filas insertadas por cualquier cliente.
  useEffect(
    () => repository.subscribe((emission) => dispatch({ type: 'realtime/insert', emission })),
    [repository],
  )

  const reload = useCallback(() => {
    dispatch({ type: 'load/start' })
    bumpReloadKey()
  }, [])

  const addEmission = useCallback(
    async (input: NewEmission): Promise<boolean> => {
      dispatch({ type: 'add/start' })
      try {
        const emission = await repository.create(input)
        if (mountedRef.current) dispatch({ type: 'add/success', emission })
        return true
      } catch (error) {
        if (mountedRef.current) dispatch({ type: 'add/error', error: toMessage(error) })
        return false
      }
    },
    [repository],
  )

  const clearSubmitError = useCallback(() => dispatch({ type: 'submitError/clear' }), [])

  // Solo se recalcula cuando cambia la lista, no en cada render.
  const totals = useMemo<EmissionTotals>(() => {
    const byCategory = Object.fromEntries(EMISSION_CATEGORIES.map((c) => [c, 0])) as Record<EmissionCategory, number>
    let total = 0
    for (const emission of state.emissions) {
      byCategory[emission.category] += emission.co2Kg
      total += emission.co2Kg
    }
    return { total, byCategory }
  }, [state.emissions])

  return {
    emissions: state.emissions,
    status: state.status,
    loadError: state.loadError,
    isSubmitting: state.isSubmitting,
    submitError: state.submitError,
    totals,
    mode: repository.mode,
    reload,
    addEmission,
    clearSubmitError,
  } as const
}
