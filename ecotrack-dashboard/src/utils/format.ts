const co2Formatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const dateFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export const formatCo2 = (kg: number): string => `${co2Formatter.format(kg)} kg`
export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso))
