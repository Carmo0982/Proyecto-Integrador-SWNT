import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { EMISSION_CATEGORIES, type NewEmission } from '../../types/emission'
import {
  SOURCE_NAME_MAX,
  validateEmission,
  type EmissionFormErrors,
  type EmissionFormValues,
} from '../../utils/validation'
import { CATEGORY_META } from './categoryMeta'
import { Spinner } from './Feedback'

interface EmissionFormProps {
  onSubmit: (input: NewEmission) => Promise<boolean>
  isSubmitting: boolean
  submitError: string | null
  onClearSubmitError: () => void
}

const EMPTY: EmissionFormValues = { sourceName: '', category: 'transporte', co2Kg: '' }
const FIELD_ORDER: (keyof EmissionFormValues)[] = ['sourceName', 'category', 'co2Kg']

const inputBase =
  'mt-1.5 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50'
const inputState = (invalid: boolean) =>
  invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'

export function EmissionForm({ onSubmit, isSubmitting, submitError, onClearSubmitError }: EmissionFormProps) {
  const id = useId()
  const [values, setValues] = useState<EmissionFormValues>(EMPTY)
  const [errors, setErrors] = useState<EmissionFormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const fieldRefs = useRef<Partial<Record<keyof EmissionFormValues, HTMLInputElement | HTMLSelectElement | null>>>({})

  // El mensaje de éxito desaparece solo después de unos segundos.
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const field = event.target.name as keyof EmissionFormValues
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    if (submitError) onClearSubmitError()
    // Tras el primer intento, se revalida mientras el usuario corrige.
    if (submitted) {
      const result = validateEmission(next)
      setErrors(result.ok ? {} : result.errors)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setSuccessMessage('')
    const result = validateEmission(values)
    if (!result.ok) {
      setErrors(result.errors)
      const firstInvalid = FIELD_ORDER.find((field) => result.errors[field])
      if (firstInvalid) fieldRefs.current[firstInvalid]?.focus()
      return
    }
    setErrors({})
    const saved = await onSubmit(result.value)
    if (saved) {
      setValues(EMPTY)
      setSubmitted(false)
      setSuccessMessage(`Medición de "${result.value.sourceName}" registrada.`)
      fieldRefs.current.sourceName?.focus()
    }
  }

  const describedBy = (field: keyof EmissionFormValues, hint?: string) =>
    [hint, errors[field] ? `${id}-${field}-error` : undefined].filter(Boolean).join(' ') || undefined

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${id}-title`}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id={`${id}-title`} className="text-lg font-semibold text-slate-900">Nueva medición</h2>
      <p className="mt-1 text-sm text-slate-600">Los campos marcados con * son obligatorios.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor={`${id}-sourceName`} className="text-sm font-medium text-slate-800">
            Nombre de la fuente *
          </label>
          <input
            ref={(el) => { fieldRefs.current.sourceName = el }}
            id={`${id}-sourceName`}
            name="sourceName"
            type="text"
            autoComplete="off"
            maxLength={SOURCE_NAME_MAX}
            placeholder="Ej.: Caldera planta Sur"
            value={values.sourceName}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(errors.sourceName)}
            aria-describedby={describedBy('sourceName')}
            className={`${inputBase} ${inputState(Boolean(errors.sourceName))}`}
          />
          {errors.sourceName && (
            <p id={`${id}-sourceName-error`} className="mt-1.5 text-sm text-red-700">{errors.sourceName}</p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-category`} className="text-sm font-medium text-slate-800">Categoría *</label>
          <select
            ref={(el) => { fieldRefs.current.category = el }}
            id={`${id}-category`}
            name="category"
            value={values.category}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(errors.category)}
            aria-describedby={describedBy('category')}
            className={`${inputBase} ${inputState(Boolean(errors.category))}`}
          >
            {EMISSION_CATEGORIES.map((category) => (
              <option key={category} value={category}>{CATEGORY_META[category].label}</option>
            ))}
          </select>
          {errors.category && (
            <p id={`${id}-category-error`} className="mt-1.5 text-sm text-red-700">{errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-co2Kg`} className="text-sm font-medium text-slate-800">
            CO₂ producido (kg) *
          </label>
          <input
            ref={(el) => { fieldRefs.current.co2Kg = el }}
            id={`${id}-co2Kg`}
            name="co2Kg"
            type="text"
            inputMode="decimal"
            placeholder="Ej.: 125,5"
            value={values.co2Kg}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(errors.co2Kg)}
            aria-describedby={describedBy('co2Kg', `${id}-co2Kg-hint`)}
            className={`${inputBase} ${inputState(Boolean(errors.co2Kg))}`}
          />
          <p id={`${id}-co2Kg-hint`} className="mt-1.5 text-xs text-slate-500">Kilogramos de CO₂ equivalente. Acepta coma o punto decimal.</p>
          {errors.co2Kg && (
            <p id={`${id}-co2Kg-error`} className="mt-1 text-sm text-red-700">{errors.co2Kg}</p>
          )}
        </div>
      </div>

      {submitError && (
        <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && <Spinner />}
        {isSubmitting ? 'Guardando…' : 'Agregar medición'}
      </button>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-medium text-emerald-800">
        {successMessage}
      </p>
    </form>
  )
}
