// Modelo de dominio de producto (camelCase), independiente del esquema de la BD.
export interface Product {
  id: string
  name: string
  sku: string
  stock: number
  /** Porcentaje de material reciclado (0-100). */
  recycledPercentage: number
  /** Huella de carbono por unidad, en kg de CO2 equivalente. */
  carbonFootprintKg: number
  createdAt: string
}
