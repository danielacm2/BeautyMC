/**
 * DATOS DE DEMOSTRACIÓN: disponibilidad provisional.
 *
 * Todo lo que hay en este archivo (semanas, horas de atención y horas ocupadas) es de ejemplo y
 * NO representa la disponibilidad real del salón. Cuando exista el backend, este módulo se
 * sustituirá por la información que entregue el servidor.
 *
 * Las funciones de fechas y horas de uso general están en `@/lib/date-utils`.
 */
import { buildWeek, toDateKey } from '@/lib/date-utils'

export type AvailabilityWeek = { days: Date[]; hasSchedule: boolean }

// Inicio (año, mes, día) de las seis semanas de ejemplo, de lunes a domingo.
const DEMO_WEEK_STARTS: ReadonlyArray<readonly [number, number, number]> = [
  [2026, 11, 16],
  [2026, 11, 23],
  [2026, 11, 30],
  [2026, 12, 7],
  [2026, 12, 14],
  [2026, 12, 21],
]

// Horas de atención de ejemplo: lunes a viernes y sábado (el domingo está cerrado).
const DEMO_WEEKDAY_TIMES: readonly string[] = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
]
const DEMO_SATURDAY_TIMES: readonly string[] = ['10:00', '11:00', '12:00', '13:00', '14:00']

// Horas ocupadas de ejemplo: 2 o 3 por día de la semana (0 = domingo).
const DEMO_BUSY_TIMES_BY_WEEKDAY: Record<number, readonly string[]> = {
  0: [],
  1: ['12:00', '16:00'],
  2: ['11:00', '15:00', '18:00'],
  3: ['13:00', '17:00'],
  4: ['10:00', '14:00', '19:00'],
  5: ['12:00', '18:00'],
  6: ['11:00', '13:00'],
}

/**
 * Semanas de ejemplo. Cada pantalla decide cuáles se muestran sin horarios pasando en
 * `emptyWeekStarts` la clave (YYYY-MM-DD) del primer día de esas semanas.
 */
export function getDemoWeeks({ emptyWeekStarts = [] }: { emptyWeekStarts?: string[] } = {}): AvailabilityWeek[] {
  return DEMO_WEEK_STARTS.map(([year, month, day]) => {
    const days = buildWeek(year, month, day)
    return { days, hasSchedule: !emptyWeekStarts.includes(toDateKey(days[0])) }
  })
}

/** Horas de atención de ejemplo para un día de la semana (0 = domingo, 6 = sábado). */
export function getDemoDayTimes(weekday: number): readonly string[] {
  if (weekday === 0) return []
  return weekday === 6 ? DEMO_SATURDAY_TIMES : DEMO_WEEKDAY_TIMES
}

/** Horas ocupadas de ejemplo para un día de la semana (0 = domingo, 6 = sábado). */
export function getDemoBusyTimes(weekday: number): readonly string[] {
  return DEMO_BUSY_TIMES_BY_WEEKDAY[weekday] ?? []
}
