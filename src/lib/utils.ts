import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const copFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

/** Formatea un importe en pesos colombianos, por ejemplo 200000 → "$ 200.000". */
export function formatCOP(amount: number) {
  return copFormatter.format(amount)
}
