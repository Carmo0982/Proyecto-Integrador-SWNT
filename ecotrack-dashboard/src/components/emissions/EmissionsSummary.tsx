import { memo } from 'react'
import type { EmissionTotals } from '../../hooks/useEmissions'
import { EMISSION_CATEGORIES } from '../../types/emission'
import { formatCo2 } from '../../utils/format'
import { CATEGORY_META } from './categoryMeta'
import { CategoryIcon } from './CategoryIcon'

interface EmissionsSummaryProps {
  totals: EmissionTotals
  count: number
}

export const EmissionsSummary = memo(function EmissionsSummary({ totals, count }: EmissionsSummaryProps) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="col-span-2 rounded-2xl bg-slate-900 p-5 text-white shadow-sm lg:col-span-1">
        <dt className="text-sm font-medium text-slate-300">Total emitido</dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight">{formatCo2(totals.total)}</dd>
        <dd className="mt-1 text-sm text-slate-300">CO₂e · {count} {count === 1 ? 'medición' : 'mediciones'}</dd>
      </div>
      {EMISSION_CATEGORIES.map((category, index) => {
        const value = totals.byCategory[category]
        const share = totals.total > 0 ? Math.round((value / totals.total) * 100) : 0
        const meta = CATEGORY_META[category]
        return (
          <div
            key={category}
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${index === EMISSION_CATEGORIES.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}
          >
            <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CategoryIcon category={category} />
              {meta.label}
            </dt>
            <dd className="mt-2 text-xl font-bold tracking-tight text-slate-900">{formatCo2(value)}</dd>
            <dd className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="presentation">
                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${share}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{share}% del total</p>
            </dd>
          </div>
        )
      })}
    </dl>
  )
})
