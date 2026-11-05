import { isEmissionCategory, type NewEmission } from '../types/emission'

export const SOURCE_NAME_MAX = 80
export const CO2_MAX_KG = 1_000_000

export interface EmissionFormValues {
  sourceName: string
  category: string
  co2Kg: string
}

export type EmissionFormErrors = Partial<Record<keyof EmissionFormValues, string>>

export type ValidationResult =
  | { ok: true; value: NewEmission }
  | { ok: false; errors: EmissionFormErrors }

/** Valida los datos del formulario. Función pura: misma entrada, misma salida. */
export function validateEmission(values: EmissionFormValues): ValidationResult {
  const errors: EmissionFormErrors = {}
  const sourceName = values.sourceName.trim()
  const co2Kg = Number(values.co2Kg.replace(',', '.'))

  if (sourceName.length < 2) errors.sourceName = 'Escribe al menos 2 caracteres.'
  else if (sourceName.length > SOURCE_NAME_MAX) errors.sourceName = `Máximo ${SOURCE_NAME_MAX} caracteres.`

  if (!isEmissionCategory(values.category)) errors.category = 'Selecciona una categoría.'

  if (values.co2Kg.trim() === '' || !Number.isFinite(co2Kg)) errors.co2Kg = 'Ingresa un número válido.'
  else if (co2Kg <= 0) errors.co2Kg = 'Debe ser mayor que 0.'
  else if (co2Kg > CO2_MAX_KG) errors.co2Kg = 'El valor parece demasiado alto (máx. 1.000.000 kg).'

  if (Object.keys(errors).length > 0 || !isEmissionCategory(values.category)) {
    return { ok: false, errors }
  }
  return { ok: true, value: { sourceName, category: values.category, co2Kg: Math.round(co2Kg * 100) / 100 } }
}
