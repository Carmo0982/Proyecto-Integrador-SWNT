import type { EmissionCategory } from '../../types/emission'
import { CATEGORY_META } from './categoryMeta'

export function CategoryIcon({ category, className = 'size-4' }: { category: EmissionCategory; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={CATEGORY_META[category].icon} />
    </svg>
  )
}
