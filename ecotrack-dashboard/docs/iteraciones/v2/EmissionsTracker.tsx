// ITERACIÓN 2 — Componente adaptado al hook. Evidencia, NO se usa en la app.
import { useState } from 'react'
import { useEmissions } from './useEmissions'

export default function EmissionsTracker() {
  const { emissions, loading, error, addEmission, total } = useEmissions()
  const [form, setForm] = useState({ nombre_fuente: '', categoria: 'Transporte', co2_kg: 0 })

  if (loading) return <p>Cargando...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Emisiones · Total: {total} kg</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addEmission(form)
        }}
        className="my-4 flex gap-2"
      >
        <input placeholder="Fuente" value={form.nombre_fuente}
          onChange={(e) => setForm({ ...form, nombre_fuente: e.target.value })} className="border p-2" />
        <select value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="border p-2">
          <option>Transporte</option><option>Energía</option><option>Residuos</option>
        </select>
        <input type="number" value={form.co2_kg}
          onChange={(e) => setForm({ ...form, co2_kg: Number(e.target.value) })} className="border p-2" />
        <button className="bg-green-600 px-4 text-white">Agregar</button>
      </form>
      <div className="grid grid-cols-3 gap-4">
        {emissions.map((em) => (
          <div key={em.id} className="rounded border p-4">
            <h2 className="font-semibold">{em.nombre_fuente}</h2>
            <p>{em.categoria}</p>
            <p>{em.co2_kg} kg CO2</p>
          </div>
        ))}
      </div>
    </div>
  )
}
