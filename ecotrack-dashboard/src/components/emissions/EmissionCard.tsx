import { memo } from 'react'
import type { Emission } from '../../types/emission'
import { formatCo2, formatDate } from '../../utils/format'
import { CATEGORY_META } from './categoryMeta'
import { CategoryIcon } from './CategoryIcon'

interface EmissionCardProps {
  emission: Emission
}

/** Tarjeta presentacional. `memo` evita re-renderizarla si su medición no cambió. */
export const EmissionCard = memo(function EmissionCard({ emission }: EmissionCardProps) {
  const meta = CATEGORY_META[emission.category]
  return (
    <article className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-slate-900">{emission.sourceName}</h3>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.badge}`}>
          <CategoryIcon category={emission.category} className="size-3.5" />
          {meta.label}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="whitespace-nowrap text-2xl font-bold tracking-tight text-slate-900">
          {formatCo2(emission.co2Kg)}
          <span className="ml-1 text-sm font-medium text-slate-500">CO₂e</span>
        </p>
        <time dateTime={emission.measuredAt} className="text-xs text-slate-500">
          {formatDate(emission.measuredAt)}
        </time>
      </div>
    </article>
  )
})
