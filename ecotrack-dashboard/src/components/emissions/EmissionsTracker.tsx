import { useMemo, useState } from 'react'
import { useEmissions } from '../../hooks/useEmissions'
import type { EmissionsRepository } from '../../services/emissionsRepository'
import { EMISSION_CATEGORIES, type EmissionCategory } from '../../types/emission'
import { CATEGORY_META } from './categoryMeta'
import { EmissionCard } from './EmissionCard'
import { EmissionForm } from './EmissionForm'
import { EmissionsSummary } from './EmissionsSummary'
import { CardsSkeleton, EmptyState, ErrorState } from './Feedback'

type Filter = EmissionCategory | 'todas'

interface EmissionsTrackerProps {
  /** Permite inyectar otra fuente de datos (pruebas, demo). */
  repository?: EmissionsRepository
}

/** Dashboard de emisiones: compone el hook con los componentes presentacionales. */
export function EmissionsTracker({ repository }: EmissionsTrackerProps) {
  const { emissions, status, loadError, isSubmitting, submitError, totals, mode, reload, addEmission, clearSubmitError } =
    useEmissions(repository)
  const [filter, setFilter] = useState<Filter>('todas')

  const visible = useMemo(
    () => (filter === 'todas' ? emissions : emissions.filter((e) => e.category === filter)),
    [emissions, filter],
  )

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { todas: emissions.length, transporte: 0, energia: 0, residuos: 0 }
    for (const e of emissions) result[e.category] += 1
    return result
  }, [emissions])

  const filters: { value: Filter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    ...EMISSION_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_META[c].label })),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">EcoTrack</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard de Emisiones</h1>
          <p className="mt-1 text-slate-600">Huella de carbono por fuente, actualizada en tiempo real.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs sm:self-auto">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          {mode === 'supabase' ? 'En vivo · Supabase' : 'En vivo · Datos simulados'}
        </span>
      </header>

      <section aria-label="Resumen de emisiones" className="mt-8">
        {status === 'success' ? (
          <EmissionsSummary totals={totals} count={emissions.length} />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={`h-32 animate-pulse rounded-2xl bg-slate-200/70 ${i === 0 ? 'col-span-2 lg:col-span-1' : ''}`} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-6">
          <EmissionForm
            onSubmit={addEmission}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onClearSubmitError={clearSubmitError}
          />
        </aside>

        <section aria-labelledby="emissions-list-title" aria-busy={status === 'loading'}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="emissions-list-title" className="text-lg font-semibold text-slate-900">Mediciones</h2>
            <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
              {filters.map(({ value, label }) => {
                const active = filter === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      active ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label} <span className={active ? 'text-slate-300' : 'text-slate-500'}>({counts[value]})</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4">
            {status === 'loading' && <CardsSkeleton />}
            {status === 'error' && loadError && <ErrorState message={loadError} onRetry={reload} />}
            {status === 'success' && visible.length === 0 && <EmptyState filtered={filter !== 'todas'} />}
            {status === 'success' && visible.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((emission) => (
                  <li key={emission.id}>
                    <EmissionCard emission={emission} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
