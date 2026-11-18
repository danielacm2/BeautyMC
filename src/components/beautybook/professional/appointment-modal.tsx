'use client'

import { useEffect, useRef } from 'react'
import { CalendarDays, Clock3, MessageCircle } from 'lucide-react'
import { demoCustomers, type DemoAppointment } from '@/lib/dashboard-demo-data'
import { Avatar } from '@/components/beautybook/dashboard-ui'
import { formatCOP } from '@/lib/utils'

export function ProfessionalAppointmentModal({
  appointment,
  onClose,
}: {
  appointment: DemoAppointment
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const customer = demoCustomers.find((item) => item.name === appointment.customer)
  const visitsSuffix = customer ? ` · ${customer.visits} visitas previas` : ''
  const whatsappHref = `https://wa.me/${appointment.phone.replace(/\D/g, '')}`

  return (
    <div
      className="bb-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="bb-ficha" role="dialog" aria-modal="true" aria-labelledby="bb-ficha-title">
        <div className="bb-ficha-head">
          <div className="bb-ficha-client">
            <Avatar initials={appointment.initials} className="bb-avatar-large" />
            <div>
              <div className="bb-ficha-name-row">
                <strong id="bb-ficha-title" className="bb-ficha-name">
                  {appointment.customer}
                </strong>
                {appointment.status !== 'Completada' && <span className="bb-next-tag">PRÓXIMA</span>}
              </div>
              <p className="bb-ficha-phone">
                {appointment.phone}
                {visitsSuffix}
              </p>
            </div>
          </div>
          <button ref={closeRef} type="button" className="bb-ficha-close" onClick={onClose} aria-label="Cerrar ficha">
            ×
          </button>
        </div>

        <div className="bb-ficha-service">
          <div>
            <span className="bb-ficha-label">SERVICIO PROGRAMADO</span>
            <strong className="bb-ficha-service-name">{appointment.service}</strong>
          </div>
          <div className="bb-ficha-tarifa">
            <span className="bb-ficha-label">TARIFA</span>
            <strong>{formatCOP(appointment.price)}</strong>
          </div>
        </div>

        <div className="bb-ficha-grid">
          <div className="bb-ficha-box">
            <span className="bb-ficha-label">
              <CalendarDays size={12} aria-hidden="true" /> FECHA
            </span>
            <strong>{appointment.date}</strong>
          </div>
          <div className="bb-ficha-box">
            <span className="bb-ficha-label">
              <Clock3 size={12} aria-hidden="true" /> HORA
            </span>
            <strong>{appointment.time}</strong>
          </div>
        </div>

        <div className="bb-ficha-foot">
          <a
            className="bb-ficha-wa"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar por WhatsApp a ${appointment.customer}`}
          >
            <MessageCircle size={16} aria-hidden="true" />
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
