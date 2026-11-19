import type { DemoAppointment } from '@/lib/dashboard-demo-data'

export const PROFESSIONAL_NAME = 'Laura Martín'
export const PROFESSIONAL_INITIALS = 'LM'

/** Semana de muestra del panel (sin backend): del lunes 9 al domingo 15 de noviembre de 2026. */
export const WEEK_DAYS = [
  { day: 'Lun', date: '9' },
  { day: 'Mar', date: '10' },
  { day: 'Mié', date: '11' },
  { day: 'Jue', date: '12' },
  { day: 'Vie', date: '13' },
  { day: 'Sáb', date: '14' },
  { day: 'Dom', date: '15' },
]
/** Posición de "hoy" (sábado 14) dentro de WEEK_DAYS en los datos de muestra. */
export const TODAY_INDEX = 5
/** Hora de inicio y fin del turno por día de WEEK_DAYS (-1 = día sin turno). */
export const WORK_START: Record<number, number> = { 0: 9, 1: 9, 2: 9, 3: 9, 4: 9, 5: 10, 6: -1 }
export const WORK_END: Record<number, number> = { 0: 17, 1: 17, 2: 17, 3: 17, 4: 17, 5: 15, 6: -1 }

/**
 * Posición (0–6) que ocupa en WEEK_DAYS la fecha de una cita de muestra ("Hoy, 14 nov.",
 * "Lun, 16 nov."), o null si cae fuera de esa semana. Se decide por el número del día y el mes:
 * el nombre del día solo se usa cuando la fecha no trae número ("Hoy").
 */
export function dayIndexInWeek(date: string): number | null {
  const parts = date.match(/(\d{1,2})\s*([A-Za-zñÑ]+)/)
  if (parts) {
    if (!parts[2].toLowerCase().startsWith('nov')) return null
    const found = WEEK_DAYS.findIndex((day) => day.date === parts[1])
    return found >= 0 ? found : null
  }
  return date.trim().toLowerCase().startsWith('hoy') ? TODAY_INDEX : null
}

/** Citas (no canceladas) que caen dentro de la semana de muestra. */
export function appointmentsInWeek(appointments: DemoAppointment[]): DemoAppointment[] {
  return appointments.filter((appointment) => appointment.status !== 'Cancelada' && dayIndexInWeek(appointment.date) !== null)
}
