/**
 * Utilidades generales de fechas y horas.
 *
 * Todas las fechas se manejan en hora LOCAL del navegador. No uses `new Date('YYYY-MM-DD')`:
 * ese formato se interpreta como UTC y en Colombia (UTC−5) devolvería el día anterior.
 * Para construir una fecha a partir de sus partes usa `new Date(año, mes - 1, día)`.
 */

const pad = (value: number) => String(value).padStart(2, '0')

/** Clave estándar de un día en formato YYYY-MM-DD (con ceros de relleno), calculada con la fecha local. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Convierte al formato estándar las claves guardadas con el formato anterior, que no tenía
 * ceros de relleno (por ejemplo "2026-12-3" pasa a "2026-12-03"). Cualquier otro valor se
 * devuelve sin cambios. Sirve para leer datos antiguos guardados en el navegador (sessionStorage).
 */
export function normalizeDateKey(value: string): string {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value)
  if (!match) return value
  return `${match[1]}-${pad(Number(match[2]))}-${pad(Number(match[3]))}`
}

/** Indica si dos fechas caen en el mismo día del calendario local. */
export function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

/** Inicio (00:00, hora local) del día de hoy. */
export function startOfToday(): Date {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return start
}

/** Siete días consecutivos a partir de la fecha indicada. `month` va de 1 a 12. */
export function buildWeek(year: number, month: number, day: number): Date[] {
  return Array.from({ length: 7 }, (_, offset) => new Date(year, month - 1, day + offset))
}

/** Minutos desde las 00:00 de una hora en formato "HH:MM" (24 horas). */
export function timeInMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

/** Indica si la hora "HH:MM" de un día ya pasó, solo cuando ese día es el mismo que `now`. */
export function isPastTimeSlot(date: Date | null, time: string, now: Date | null): boolean {
  if (!date || !now || !isSameDay(date, now)) return false
  return timeInMinutes(time) < now.getHours() * 60 + now.getMinutes()
}
