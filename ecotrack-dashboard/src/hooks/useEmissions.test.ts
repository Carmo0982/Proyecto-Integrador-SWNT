import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createMockRepository } from '../services/emissionsRepository'
import type { Emission } from '../types/emission'
import { useEmissions } from './useEmissions'

const seed: Emission[] = [
  { id: 'a', sourceName: 'Camión 1', category: 'transporte', co2Kg: 100, measuredAt: '2026-11-01T10:00:00Z' },
  { id: 'b', sourceName: 'Planta', category: 'energia', co2Kg: 50.5, measuredAt: '2026-11-01T09:00:00Z' },
]

describe('useEmissions', () => {
  it('pasa de loading a success y calcula totales', async () => {
    const repo = createMockRepository({ latencyMs: 5, seed })
    const { result } = renderHook(() => useEmissions(repo))
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.emissions).toHaveLength(2)
    expect(result.current.totals.total).toBeCloseTo(150.5)
    expect(result.current.totals.byCategory).toEqual({ transporte: 100, energia: 50.5, residuos: 0 })
  })

  it('expone el error de carga y permite reintentar', async () => {
    const repo = createMockRepository({ latencyMs: 5, seed, failList: true })
    const { result } = renderHook(() => useEmissions(repo))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.loadError).toMatch(/No se pudieron cargar/)
    act(() => result.current.reload())
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('inserta una medición una sola vez aunque Realtime también la notifique', async () => {
    const repo = createMockRepository({ latencyMs: 5, seed })
    const { result } = renderHook(() => useEmissions(repo))
    await waitFor(() => expect(result.current.status).toBe('success'))
    let ok = false
    await act(async () => {
      ok = await result.current.addEmission({ sourceName: 'Caldera', category: 'residuos', co2Kg: 10 })
    })
    expect(ok).toBe(true)
    expect(result.current.emissions).toHaveLength(3)
    expect(result.current.emissions.filter((e) => e.sourceName === 'Caldera')).toHaveLength(1)
    expect(result.current.totals.byCategory.residuos).toBe(10)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('reporta el error de inserción sin perder la lista', async () => {
    const repo = createMockRepository({ latencyMs: 5, seed, failCreate: true })
    const { result } = renderHook(() => useEmissions(repo))
    await waitFor(() => expect(result.current.status).toBe('success'))
    let ok = true
    await act(async () => {
      ok = await result.current.addEmission({ sourceName: 'X', category: 'energia', co2Kg: 1 })
    })
    expect(ok).toBe(false)
    expect(result.current.submitError).toMatch(/RLS/)
    expect(result.current.emissions).toHaveLength(2)
    act(() => result.current.clearSubmitError())
    expect(result.current.submitError).toBeNull()
  })

  it('agrega en vivo las mediciones creadas por otros clientes', async () => {
    const repo = createMockRepository({ latencyMs: 5, seed })
    const { result } = renderHook(() => useEmissions(repo))
    await waitFor(() => expect(result.current.status).toBe('success'))
    // Otro cliente inserta usando el mismo backend.
    await act(async () => {
      await repo.create({ sourceName: 'Sensor externo', category: 'energia', co2Kg: 5 })
    })
    expect(result.current.emissions[0]?.sourceName).toBe('Sensor externo')
  })

  it('mantiene la misma referencia de totals si la lista no cambia (useMemo)', async () => {
    const repo = createMockRepository({ latencyMs: 5, seed })
    const { result, rerender } = renderHook(() => useEmissions(repo))
    await waitFor(() => expect(result.current.status).toBe('success'))
    const before = result.current.totals
    rerender()
    expect(result.current.totals).toBe(before)
  })
})
