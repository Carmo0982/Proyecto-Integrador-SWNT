import { useCallback, useEffect, useState } from 'react'
import { getProducts } from '@/services'
import type { Product } from '@/types'

// Ejemplo de referencia: así se conecta la UI con la capa de servicios.
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    getProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const refresh = useCallback(() => {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }, [])

  return { products, loading, error, refresh }
}
