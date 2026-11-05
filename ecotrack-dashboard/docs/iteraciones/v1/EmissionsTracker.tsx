// ITERACIÓN 1 — Salida de la IA al "Prompt de Estructura".
// Se conserva sin cambios como evidencia. NO se usa en la app.
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export default function EmissionsTracker() {
  const [emissions, setEmissions] = useState<any[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Transporte')
  const [co2, setCo2] = useState('')

  useEffect(() => {
    supabase.from('emisiones').select('*').then(({ data }) => {
      setEmissions(data || [])
    })
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await supabase.from('emisiones').insert({ nombre_fuente: name, categoria: category, co2_kg: co2 })
    const { data } = await supabase.from('emisiones').select('*')
    setEmissions(data || [])
    setName('')
    setCo2('')
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Emisiones</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 my-4">
        <input placeholder="Fuente" value={name} onChange={(e) => setName(e.target.value)} className="border p-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2">
          <option>Transporte</option>
          <option>Energía</option>
          <option>Residuos</option>
        </select>
        <input placeholder="CO2" value={co2} onChange={(e) => setCo2(e.target.value)} className="border p-2" />
        <button className="bg-green-600 text-white px-4">Agregar</button>
      </form>
      <div className="grid grid-cols-3 gap-4">
        {emissions.map((em) => (
          <div key={em.id} className="border rounded p-4">
            <h2 className="font-semibold">{em.nombre_fuente}</h2>
            <p>{em.categoria}</p>
            <p>{em.co2_kg} kg CO2</p>
          </div>
        ))}
      </div>
    </div>
  )
}
