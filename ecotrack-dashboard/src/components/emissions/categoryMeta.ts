import type { EmissionCategory } from '../../types/emission'

interface CategoryMeta {
  label: string
  /** Clases de Tailwind completas (no se construyen dinámicamente para que Tailwind las detecte). */
  badge: string
  bar: string
  icon: string
}

export const CATEGORY_META: Record<EmissionCategory, CategoryMeta> = {
  transporte: {
    label: 'Transporte',
    badge: 'bg-sky-50 text-sky-800 ring-sky-200',
    bar: 'bg-sky-500',
    icon: 'M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  },
  energia: {
    label: 'Energía',
    badge: 'bg-amber-50 text-amber-800 ring-amber-200',
    bar: 'bg-amber-500',
    icon: 'M13 2 4 14h7l-1 8 9-12h-7z',
  },
  residuos: {
    label: 'Residuos',
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    bar: 'bg-emerald-500',
    icon: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  },
}
