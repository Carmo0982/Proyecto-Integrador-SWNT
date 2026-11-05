export function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Cargando mediciones…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-5" aria-hidden="true">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/4 rounded-full bg-slate-100" />
          <div className="mt-8 h-6 w-1/2 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
      <h3 className="font-semibold">No pudimos cargar las mediciones</h3>
      <p className="mt-1 text-sm text-red-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        Reintentar
      </button>
    </div>
  )
}

export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="font-semibold text-slate-900">
        {filtered ? 'No hay mediciones en esta categoría' : 'Aún no hay mediciones'}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {filtered ? 'Prueba con otra categoría o registra una nueva medición.' : 'Registra la primera usando el formulario.'}
      </p>
    </div>
  )
}
