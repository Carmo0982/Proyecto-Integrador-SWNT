export const EMISSION_CATEGORIES = ['transporte', 'energia', 'residuos'] as const

export type EmissionCategory = (typeof EMISSION_CATEGORIES)[number]

/** Medición de emisiones en el modelo de dominio (camelCase). */
export interface Emission {
  readonly id: string
  readonly sourceName: string
  readonly category: EmissionCategory
  /** Kilogramos de CO2 equivalente. */
  readonly co2Kg: number
  readonly measuredAt: string
}

export type NewEmission = Pick<Emission, 'sourceName' | 'category' | 'co2Kg'>

export function isEmissionCategory(value: unknown): value is EmissionCategory {
  return typeof value === 'string' && (EMISSION_CATEGORIES as readonly string[]).includes(value)
}
