import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createMockRepository } from '../../services/emissionsRepository'
import { EmissionsTracker } from './EmissionsTracker'

afterEach(cleanup)

describe('EmissionsTracker', () => {
  it('muestra el loader y luego las tarjetas', async () => {
    render(<EmissionsTracker repository={createMockRepository({ latencyMs: 5 })} />)
    expect(screen.getByText('Cargando mediciones…')).toBeTruthy()
    expect(await screen.findByText('Flota de camiones de reparto')).toBeTruthy()
  })

  it('valida el formulario, marca los campos y enfoca el primero inválido', async () => {
    render(<EmissionsTracker repository={createMockRepository({ latencyMs: 5 })} />)
    await screen.findByText('Flota de camiones de reparto')
    fireEvent.click(screen.getByRole('button', { name: 'Agregar medición' }))
    const name = screen.getByLabelText('Nombre de la fuente *')
    expect(name.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(name)
    expect(screen.getByText('Ingresa un número válido.')).toBeTruthy()
  })

  it('agrega una medición y anuncia el éxito', async () => {
    render(<EmissionsTracker repository={createMockRepository({ latencyMs: 5 })} />)
    await screen.findByText('Flota de camiones de reparto')
    fireEvent.change(screen.getByLabelText('Nombre de la fuente *'), { target: { value: 'Horno industrial' } })
    fireEvent.change(screen.getByLabelText('CO₂ producido (kg) *'), { target: { value: '88,4' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Agregar medición' }))
    })
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Horno industrial/))
    expect(screen.getAllByText('Horno industrial')).toHaveLength(1)
  })

  it('muestra el error de carga con botón de reintento', async () => {
    render(<EmissionsTracker repository={createMockRepository({ latencyMs: 5, failList: true })} />)
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy()
  })
})
