'use client'

import { useState } from 'react'
import { CalendarDays, CircleCheck, Eye, Heart, Sparkles, User, Users, type LucideIcon } from 'lucide-react'
import type { DemoAppointment } from '@/lib/dashboard-demo-data'

const activityCurrent = [
  { day: 'Lun', full: 'Lunes', value: 18 },
  { day: 'Mar', full: 'Martes', value: 26 },
  { day: 'Mié', full: 'Miércoles', value: 21 },
  { day: 'Jue', full: 'Jueves', value: 33 },
  { day: 'Vie', full: 'Viernes', value: 29 },
  { day: 'Sáb', full: 'Sábado', value: 38 },
]
const activityMonth = [
  { day: 'Sem 1', full: 'Semana 1', value: 132 },
  { day: 'Sem 2', full: 'Semana 2', value: 148 },
  { day: 'Sem 3', full: 'Semana 3', value: 140 },
  { day: 'Sem 4', full: 'Semana 4', value: 162 },
]
const ACTIVITY_TODAY_INDEX = 5

const teamOnShift = [
  {
    initials: 'LM',
    name: 'Laura Martín',
    specialty: 'Corte & Maquillaje',
    status: 'En sesión · 10:00',
    statusBg: '#F7F0E2',
    statusColor: '#9C7332',
  },
  {
    initials: 'CR',
    name: 'Clara Ruiz',
    specialty: 'Manicura & Spa',
    status: 'En sesión · 10:30',
    statusBg: '#F7F0E2',
    statusColor: '#9C7332',
  },
  {
    initials: 'IV',
    name: 'Inés Vega',
    specialty: 'Cejas & Pestañas',
    status: 'Disponible',
    statusBg: '#EBF2ED',
    statusColor: '#4A7C59',
  },
]

const valeriaSample: DemoAppointment = {
  id: 'BB-1056',
  customer: 'Valeria Gómez',
  initials: 'VG',
  phone: '+57 300 000 0000',
  email: 'valeria.g@example.com',
  service: 'Lifting de pestañas',
  professional: 'Inés Vega',
  date: 'Hoy, 14 nov.',
  time: '15:30',
  price: 180000,
  status: 'Confirmada',
}

const kpiCards: {
  icon: LucideIcon
  label: string
  value: string
  iconBg: string
  iconColor: string
  badge: string
  badgeBg: string
  badgeColor: string
}[] = [
  {
    icon: CalendarDays,
    label: 'Citas de hoy',
    value: '12',
    iconBg: '#F5ECE8',
    iconColor: '#B07D6B',
    badge: '↗ +2',
    badgeBg: '#EBF2ED',
    badgeColor: '#4A7C59',
  },
  {
    icon: CircleCheck,
    label: 'Citas esta semana',
    value: '86',
    iconBg: '#EBF2ED',
    iconColor: '#4A7C59',
    badge: '↗ +10,3%',
    badgeBg: '#EBF2ED',
    badgeColor: '#4A7C59',
  },
  {
    icon: Heart,
    label: 'Clientas registradas',
    value: '1.284',
    iconBg: '#F7F0E2',
    iconColor: '#8F4F3F',
    badge: '↗ +5,8%',
    badgeBg: '#EBF2ED',
    badgeColor: '#4A7C59',
  },
  {
    icon: Sparkles,
    label: 'Profesionales activas',
    value: '3',
    iconBg: '#F5ECE8',
    iconColor: '#B07D6B',
    badge: '100% activas',
    badgeBg: '#F4EFEA',
    badgeColor: '#6B5E57',
  },
]

export function AdminHome({
  appointments,
  onOpen,
  onNavigate,
}: {
  appointments: DemoAppointment[]
  onOpen: (appointment: DemoAppointment) => void
  onNavigate: (id: string) => void
}) {
  const next = appointments.filter((item) => !item.date.startsWith('Hoy') && item.status !== 'Cancelada').slice(0, 3)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const agendaRows: DemoAppointment[] = [
    ...appointments.filter((item) => ['BB-1048', 'BB-1049', 'BB-1050', 'BB-1051'].includes(item.id)),
    valeriaSample,
  ]
  const activityDays = period === 'week' ? activityCurrent : activityMonth
  const isWeek = period === 'week'
  const barHeights = isWeek ? [68, 98, 80, 124, 110, 144] : [95, 110, 102, 144]
  return (
    <div className="bb-page-stack">
      <section className="bb-hello-panel" aria-labelledby="bb-hello-title">
        <div className="bb-hello-mark" aria-hidden="true">
          b
        </div>
        <div className="bb-hello-copy">
          <span className="bb-hello-eyebrow">
            <span>SÁBADO, 14 DE NOVIEMBRE</span>
            <i className="bb-hello-dot" aria-hidden="true" />
            <span className="relative flex h-2.5 w-2.5 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span>
            </span>
            <span>ESTUDIO ABIERTO · 3 ESPECIALISTAS EN TURNO</span>
          </span>
          <h2 id="bb-hello-title">
            {'Buenos días, Ana '}
            <span className="bb-hello-star" aria-hidden="true">
              ✳
            </span>
          </h2>
          <p>Tu estudio está en marcha. Aquí tienes el resumen de hoy.</p>
        </div>
        <div className="bb-hello-actions">
          <button type="button" className="bb-hello-secondary" onClick={() => onNavigate('citas')}>
            <CalendarDays aria-hidden="true" />
            Ver agenda de hoy
          </button>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bb-kpi-grid">
            {kpiCards.map(({ icon: Icon, label, value, iconBg, iconColor, badge, badgeBg, badgeColor }) => (
              <article className="bb-kpi-card" key={label}>
                <div className="bb-kpi-top">
                  <span className="bb-kpi-icon" style={{ background: iconBg, color: iconColor }}>
                    <Icon aria-hidden="true" strokeWidth={1.75} />
                  </span>
                  <span className="bb-kpi-badge" style={{ background: badgeBg, color: badgeColor }}>
                    {badge}
                  </span>
                </div>
                <span className="bb-kpi-label">{label}</span>
                <strong className="bb-kpi-value">{value}</strong>
              </article>
            ))}
          </div>
          <section
            className="bg-white border border-[#EAE3DC] rounded-2xl p-6 pb-6"
            aria-labelledby="bb-activity-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 id="bb-activity-title" className="font-serif text-2xl text-[#4A4039]">
                    Actividad de citas
                  </h2>
                  <span className="bg-[#EBF2ED] text-[#4A7C59] text-xs font-medium px-2.5 py-1 rounded-full">
                    {isWeek ? '+12,8% vs. semana anterior' : '+18,4% vs. mes anterior'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <strong className="font-serif text-3xl text-[#4A4039]">{isWeek ? 146 : 582}</strong>
                  <span className="text-sm text-[#7A6F69]">
                    citas completadas {isWeek ? 'esta semana' : 'este mes'}
                  </span>
                </div>
              </div>
              <div
                className="bg-[#FAF8F5] border border-[#EAE3DC] p-1 rounded-xl flex gap-1"
                role="group"
                aria-label="Periodo del gráfico"
              >
                <button
                  type="button"
                  onClick={() => setPeriod('week')}
                  aria-pressed={isWeek}
                  className={
                    isWeek
                      ? 'bg-white shadow-xs text-[#4A4039] font-medium px-3.5 py-1.5 rounded-lg text-sm'
                      : 'text-[#7A6F69] px-3.5 py-1.5 text-sm'
                  }
                >
                  Esta semana
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('month')}
                  aria-pressed={!isWeek}
                  className={
                    !isWeek
                      ? 'bg-white shadow-xs text-[#4A4039] font-medium px-3.5 py-1.5 rounded-lg text-sm'
                      : 'text-[#7A6F69] px-3.5 py-1.5 text-sm'
                  }
                >
                  Este mes
                </button>
              </div>
            </div>
            <div
              className="relative h-56 flex flex-col justify-end"
              role="img"
              aria-label={`Citas por periodo: ${activityDays.map((item) => `${item.full}, ${item.value}`).join('; ')}`}
            >
              <div
                className="absolute inset-0 bottom-9 flex flex-col justify-between pointer-events-none"
                aria-hidden="true"
              >
                <div className="border-b border-dashed border-[#EAE3DC]" />
                <div className="border-b border-dashed border-[#EAE3DC]" />
                <div className="border-b border-dashed border-[#EAE3DC]" />
                <div className="border-b border-[#EAE3DC]" />
              </div>
              <div className="relative z-10 flex items-end justify-around h-full">
                {activityDays.map((item, index) => {
                  const isCurrent = index === (isWeek ? ACTIVITY_TODAY_INDEX : activityDays.length - 1)
                  return (
                    <div className="flex flex-col items-center justify-end h-full" key={item.day}>
                      <span
                        className={
                          isCurrent
                            ? 'text-xs font-semibold mb-2 text-[#B07D6B]'
                            : 'text-xs font-semibold mb-2 text-[#4A4039]'
                        }
                      >
                        {item.value}
                      </span>
                      <div
                        className={
                          isCurrent
                            ? 'w-11 sm:w-12 rounded-t-xl transition-all duration-300 bg-[#B07D6B]'
                            : 'w-11 sm:w-12 rounded-t-xl transition-all duration-300 bg-[#E3D5CE]'
                        }
                        style={{ height: `${barHeights[index]}px` }}
                        tabIndex={0}
                        role="img"
                        aria-label={`${item.full}: ${item.value} citas`}
                        title={`${item.full}: ${item.value} citas`}
                      />
                      <div className="mt-3 h-7 flex items-center justify-center">
                        {isCurrent ? (
                          <span className="bg-[#EFE5DF] text-[#8C5E4F] text-xs font-medium px-3 py-1 rounded-full">
                            {isWeek ? 'Sáb · hoy' : `${item.day} · actual`}
                          </span>
                        ) : (
                          <span className="text-xs text-[#7A6F69]">{item.day}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
          <section className="bg-white border border-[#EAE3DC] rounded-2xl p-6" aria-labelledby="bb-agenda-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 id="bb-agenda-title" className="font-serif text-2xl text-[#4A4039]">
                    Citas de hoy
                  </h2>
                  <span className="bg-[#EFE5DF] text-[#7A6F69] text-xs font-medium px-3 py-1 rounded-full">
                    Sábado, 14 nov
                  </span>
                </div>
                <p className="text-sm text-[#7A6F69] mt-1">Gestiona el estado y seguimiento de las reservas del día.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('citas')}
                className="text-sm font-medium text-[#B07D6B] hover:underline"
              >
                Ver todas →
              </button>
            </div>
            <div className="divide-y divide-[#EAE3DC] mt-2">
              {agendaRows.map((appointment) => {
                const isPending = appointment.status === 'Pendiente'
                const isNext = appointment.id === 'BB-1050'
                return (
                  <button
                    type="button"
                    key={appointment.id}
                    onClick={() => onOpen(appointment)}
                    aria-label={`${appointment.time}, ${appointment.customer}, ${appointment.service} con ${appointment.professional}`}
                    className={
                      isPending
                        ? 'w-full flex items-center gap-4 py-3.5 px-3 rounded-xl bg-[#F9F4F1] text-left'
                        : 'w-full flex items-center gap-4 py-3.5 text-left'
                    }
                  >
                    <span className="w-14 shrink-0 text-left">
                      <span className="block font-bold text-[15px] text-[#4A4039]">{appointment.time}</span>
                      {isNext && (
                        <span className="block text-[10px] font-semibold tracking-wider text-[#B07D6B] mt-0.5">
                          SIGUIENTE
                        </span>
                      )}
                    </span>
                    <span
                      className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-serif text-sm text-[#4A4039]"
                      style={
                        appointment.initials === 'ET'
                          ? { background: '#FFFFFF', border: '1px solid #EAE3DC' }
                          : { background: '#F5ECE8' }
                      }
                      aria-hidden="true"
                    >
                      {appointment.initials}
                    </span>
                    <span className="flex-1 min-w-0 text-left">
                      <span className="block text-sm font-bold text-[#4A4039]">{appointment.customer}</span>
                      <span className="block text-[13px] text-[#7A6F69]">{appointment.service}</span>
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 text-[13px] text-[#7A6F69] whitespace-nowrap">
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                      {appointment.professional}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section
            className="bg-[#EFE5DF] border border-[#E5D8D0] rounded-2xl p-6 flex flex-col gap-4 h-fit"
            aria-labelledby="bb-next-title"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-[#9A6B5B]" id="bb-next-title">
                SIGUIENTE CITA
              </span>
              <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-[#4A4039] flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B07D6B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B07D6B]"></span>
                </span>
                En 25 min · 11:00
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-[#EAE3DC]">
              <div className="flex items-center gap-3.5">
                <span
                  className="w-12 h-12 rounded-full bg-white border border-[#E5D8D0] flex items-center justify-center font-serif text-base text-[#4A4039]"
                  aria-hidden="true"
                >
                  ET
                </span>
                <div>
                  <p className="font-serif text-lg text-[#4A4039]">Elena Torres</p>
                  <p className="text-sm text-[#B07D6B]">Diseño de cejas</p>
                </div>
              </div>
              <span className="text-xs text-[#7A6F69] self-start">Cliente VIP</span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#EAE3DC]">
              <p className="text-[11px] font-semibold tracking-wider text-[#7A6F69] uppercase mb-1">PROFESIONAL</p>
              <p className="text-sm font-medium text-[#4A4039] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#B07D6B]" aria-hidden="true" />
                Inés Vega
              </p>
            </div>
            <button
              type="button"
              className="w-full bg-[#B07D6B] hover:bg-[#9C6B5A] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              onClick={() => {
                const found = appointments.find((item) => item.id === 'BB-1050')
                if (found) onOpen(found)
              }}
            >
              <Eye aria-hidden="true" strokeWidth={1.75} className="w-4 h-4" />
              Mirar
            </button>
          </section>
          <section className="bg-white border border-[#EAE3DC] rounded-2xl p-6" aria-labelledby="bb-team-title">
            <div className="flex items-center justify-between">
              <h2 id="bb-team-title" className="font-serif text-xl text-[#4A4039]">
                Equipo en turno hoy
              </h2>
              <span className="text-sm text-[#7A6F69]">3 activas</span>
            </div>
            <div className="flex flex-col gap-2.5 mt-4">
              {teamOnShift.map((member) => (
                <div
                  key={member.initials}
                  className="flex items-center gap-3 bg-[#FAF8F5] border border-[#EAE3DC] rounded-xl p-3"
                >
                  <span
                    className="w-10 h-10 shrink-0 rounded-full bg-[#EFE5DF] flex items-center justify-center font-serif text-sm text-[#4A4039]"
                    aria-hidden="true"
                  >
                    {member.initials}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-[#4A4039]">{member.name}</span>
                    <span className="block text-xs text-[#7A6F69]">{member.specialty}</span>
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ background: member.statusBg, color: member.statusColor }}
                  >
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-white border border-[#EAE3DC] rounded-2xl p-6 h-fit" aria-labelledby="bb-coming-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="bb-coming-title" className="font-serif text-2xl text-[#4A4039]">
                  Próximas citas
                </h2>
                <p className="text-sm text-[#7A6F69] mt-1">Siguientes reservas agendadas</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('citas')}
                className="text-sm font-medium text-[#B07D6B] hover:underline"
              >
                Calendario →
              </button>
            </div>
            <div className="divide-y divide-[#EAE3DC] mt-2">
              {next.map((appointment) => {
                const dayNum = appointment.date.match(/\d{1,2}/)?.[0] ?? '—'
                const month =
                  appointment.date
                    .replace(/[0-9.,]/g, '')
                    .trim()
                    .split(' ')
                    .pop()
                    ?.toUpperCase() ?? ''
                return (
                  <button
                    type="button"
                    key={appointment.id}
                    onClick={() => onOpen(appointment)}
                    aria-label={`${appointment.customer}, ${appointment.service}, ${appointment.date} a las ${appointment.time}`}
                    className="w-full flex items-center gap-3 py-3.5 text-left"
                  >
                    <span
                      className="w-12 h-12 shrink-0 rounded-xl bg-[#EFE5DF] flex flex-col items-center justify-center"
                      aria-hidden="true"
                    >
                      <strong className="font-serif text-lg leading-none text-[#4A4039]">{dayNum}</strong>
                      <small className="text-[10px] font-semibold tracking-wider text-[#B07D6B]">{month}</small>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-[#4A4039]">{appointment.customer}</span>
                      <span className="block text-[13px] text-[#7A6F69]">{appointment.service}</span>
                    </span>
                    <span className="font-serif text-sm text-[#4A4039] bg-[#FAF8F5] border border-[#EAE3DC] rounded-full px-3 py-1 whitespace-nowrap">
                      {appointment.time}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => onNavigate('servicios')}
                className="flex-1 bg-white border border-[#EAE3DC] text-[#4A4039] text-sm font-medium py-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#B07D6B]" aria-hidden="true" />
                Añadir servicio
              </button>
              <button
                type="button"
                onClick={() => onNavigate('clientes')}
                className="flex-1 bg-white border border-[#EAE3DC] text-[#4A4039] text-sm font-medium py-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5"
              >
                <Users className="w-4 h-4 text-[#B07D6B]" aria-hidden="true" />
                Ver clientes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
