// ITERACIÓN 2 — Salida de la IA al "Prompt de Lógica".
// Se conserva sin cambios como evidencia. NO se usa en la app.
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Emission {
  id: string
  nombre_fuente: string
  categoria: string
  co2_kg: number
}

export function useEmissions() {
  const [emissions, setEmissions] = useState<Emission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmissions = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('emisiones').select('*')
    if (error) setError(error.message)
    else setEmissions(data as Emission[])
    setLoading(false)
  }

  useEffect(() => {
    fetchEmissions()
  }, [])

  const addEmission = async (emission: Omit<Emission, 'id'>) => {
    setLoading(true)
    const { error } = await supabase.from('emisiones').insert(emission)
    if (error) setError(error.message)
    await fetchEmissions()
  }

  const total = emissions.reduce((sum, e) => sum + e.co2_kg, 0)

  return { emissions, loading, error, addEmission, total }
}
