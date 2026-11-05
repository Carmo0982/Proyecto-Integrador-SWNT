import { describe, expect, it } from 'vitest'
import { validateEmission } from './validation'

describe('validateEmission', () => {
  it('acepta coma decimal y normaliza el texto', () => {
    expect(validateEmission({ sourceName: '  Caldera  ', category: 'energia', co2Kg: '12,345' })).toEqual({
      ok: true,
      value: { sourceName: 'Caldera', category: 'energia', co2Kg: 12.35 },
    })
  })

  it('rechaza campos vacíos, categorías inválidas y valores no positivos', () => {
    const result = validateEmission({ sourceName: 'a', category: 'agua', co2Kg: '-3' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['category', 'co2Kg', 'sourceName'])
  })

  it('rechaza texto no numérico en CO2', () => {
    const result = validateEmission({ sourceName: 'Planta', category: 'residuos', co2Kg: 'mucho' })
    expect(result.ok).toBe(false)
  })
})
