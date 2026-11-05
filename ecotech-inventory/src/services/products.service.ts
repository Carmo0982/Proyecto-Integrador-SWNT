import { supabase, type Tables } from './supabase'
import type { Product } from '@/types'

type ProductRow = Tables<'products'>

// Traduce la fila de PostgreSQL (snake_case) al modelo de dominio (camelCase).
function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    stock: row.stock,
    recycledPercentage: row.recycled_percentage,
    carbonFootprintKg: row.carbon_footprint_kg,
    createdAt: row.created_at,
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`)
  return data.map(toProduct)
}
