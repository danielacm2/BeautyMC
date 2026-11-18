import type {
  AppointmentStatus,
  DemoAppointment,
  demoCustomers,
  demoProfessionals,
  demoServices,
} from '@/lib/dashboard-demo-data'
import { capitalize } from '@/lib/utils'

export type Customer = (typeof demoCustomers)[number]
export type ServiceItem = (typeof demoServices)[number]
export type ProfessionalItem = (typeof demoProfessionals)[number]
export type AdminModal =
  | { kind: 'appointment'; appointment: DemoAppointment }
  | { kind: 'customer'; customer: Customer }
  | { kind: 'service'; service?: ServiceItem }
  | null
export type AppointmentDraft = {
  serviceId: string
  professional: string
  dateISO: string
  dateLabel: string
  time: string
  name: string
  email: string
  phone: string
  status: AppointmentStatus
}
export type ServiceDraft = { name: string; category: string; price: number; description: string; image: string }
export type ProfessionalForm = {
  name: string
  email: string
  password: string
  phone: string
  bio: string
  schedule: string
  categories: string[]
  image: string
}
export type CustomerFilter = 'todos' | 'vip' | 'nuevos'
export type CustomerDraft = { name: string; email: string; phone: string; favoriteService: string; vip: boolean }
export type DaySchedule = { day: string; open: string; close: string; enabled: boolean }
export type Holiday = { iso: string; reason: string }

export function formatAgendaDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date).replace('.', '')
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', '')
  return `${capitalize(weekday)}, ${day} ${monthName}.`
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

export function categoryLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
