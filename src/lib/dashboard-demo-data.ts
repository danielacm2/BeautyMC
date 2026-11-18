import { professionals, services } from '@/lib/beautybook-data'

export type AppointmentStatus = 'Confirmada' | 'Pendiente' | 'Completada' | 'Cancelada'
export type DemoAppointment = {
  id: string
  customer: string
  initials: string
  phone: string
  email: string
  service: string
  professional: string
  date: string
  time: string
  price: number
  status: AppointmentStatus
}

export const demoAppointments: DemoAppointment[] = [
  { id: 'BB-1048', customer: 'Lucía Moreno', initials: 'LM', phone: '+34 612 345 872', email: 'lucia.moreno@email.com', service: 'Corte & peinado', professional: 'Laura Martín', date: 'Hoy, 14 nov.', time: '10:00', price: 200000, status: 'Confirmada' },
  { id: 'BB-1049', customer: 'Marta Sánchez', initials: 'MS', phone: '+34 678 231 490', email: 'marta.s@email.com', service: 'Manicura esencial', professional: 'Clara Ruiz', date: 'Hoy, 14 nov.', time: '10:30', price: 145000, status: 'Confirmada' },
  { id: 'BB-1050', customer: 'Elena Torres', initials: 'ET', phone: '+34 611 904 637', email: 'elena.t@email.com', service: 'Diseño de cejas', professional: 'Inés Vega', date: 'Hoy, 14 nov.', time: '11:00', price: 110000, status: 'Pendiente' },
  { id: 'BB-1051', customer: 'Paula Romero', initials: 'PR', phone: '+34 633 540 218', email: 'paula.r@email.com', service: 'Maquillaje especial', professional: 'Laura Martín', date: 'Hoy, 14 nov.', time: '12:00', price: 260000, status: 'Confirmada' },
  { id: 'BB-1052', customer: 'Sofía Castillo', initials: 'SC', phone: '+34 622 485 913', email: 'sofia.c@email.com', service: 'Lifting & mirada', professional: 'Inés Vega', date: 'Hoy, 14 nov.', time: '13:30', price: 170000, status: 'Pendiente' },
  { id: 'BB-1053', customer: 'Carmen Díaz', initials: 'CD', phone: '+34 697 124 508', email: 'carmen.d@email.com', service: 'Corte & peinado', professional: 'Laura Martín', date: 'Lun, 16 nov.', time: '10:30', price: 200000, status: 'Confirmada' },
  { id: 'BB-1054', customer: 'Irene Vidal', initials: 'IV', phone: '+34 655 730 196', email: 'irene.v@email.com', service: 'Manicura esencial', professional: 'Clara Ruiz', date: 'Lun, 16 nov.', time: '12:00', price: 145000, status: 'Confirmada' },
  { id: 'BB-1055', customer: 'Nuria Blanco', initials: 'NB', phone: '+34 644 291 365', email: 'nuria.b@email.com', service: 'Maquillaje especial', professional: 'Inés Vega', date: 'Mar, 17 nov.', time: '16:00', price: 260000, status: 'Pendiente' },
]

export const demoServices = services.map((service) => ({ ...service, active: true }))
export const demoProfessionals = professionals.map((person, index) => ({
  ...person,
  schedule: index === 1 ? 'Lun–Sáb · 10:00–18:00' : 'Lun–Sáb · 09:00–17:00',
  active: true,
  appointments: index === 0 ? 18 : index === 1 ? 14 : 12,
}))

export const demoCustomers = [
  { name: 'Lucía Moreno', initials: 'LM', email: 'lucia.moreno@email.com', phone: '+57 312 345 8720', visits: 12, lastVisit: 'Hoy, 14 nov.', favoriteService: 'Corte & peinado', vip: true, memberSince: 2024 },
  { name: 'Marta Sánchez', initials: 'MS', email: 'marta.s@email.com', phone: '+57 318 231 4901', visits: 8, lastVisit: 'Hoy, 14 nov.', favoriteService: 'Manicura esencial', vip: true, memberSince: 2024 },
  { name: 'Elena Torres', initials: 'ET', email: 'elena.t@email.com', phone: '+57 311 904 6372', visits: 5, lastVisit: '12 nov. 2026', favoriteService: 'Diseño de cejas', vip: false, memberSince: 2024 },
  { name: 'Paula Romero', initials: 'PR', email: 'paula.r@email.com', phone: '+57 300 540 2184', visits: 3, lastVisit: '10 nov. 2026', favoriteService: 'Maquillaje especial', vip: false, memberSince: 2025 },
  { name: 'Sofía Castillo', initials: 'SC', email: 'sofia.castillo@email.com', phone: '+57 322 485 9130', visits: 9, lastVisit: '8 nov. 2026', favoriteService: 'Lifting & mirada', vip: true, memberSince: 2024 },
]
