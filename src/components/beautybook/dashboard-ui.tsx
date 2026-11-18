'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react'

export function MetricCard({ label, value, note, icon: Icon, trend, tone = 'clay' }: { label: string; value: string; note: string; icon: LucideIcon; trend?: string; tone?: 'clay' | 'sage' | 'sand' | 'plum' }) {
  return <article className="bb-metric-card"><div className={`bb-metric-icon bb-tone-${tone}`}><Icon aria-hidden="true" /></div><span className="bb-metric-label">{label}</span><strong className="bb-metric-value">{value}</strong><div className="bb-metric-foot"><span>{note}</span>{trend && <span className="bb-trend"><ArrowUpRight aria-hidden="true" />{trend}</span>}</div></article>
}

const statusClass: Record<string, string> = {
  Confirmada: 'bb-status-confirmed',
  Pendiente: 'bb-status-pending',
  Completada: 'bb-status-completed',
  Cancelada: 'bb-status-cancelled',
  Activo: 'bb-status-active',
  Inactivo: 'bb-status-inactive',
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`bb-status ${statusClass[status] ?? 'bb-status-pending'}`}><i aria-hidden="true" />{status}</span>
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="bb-section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}

export function Avatar({ initials, className = '' }: { initials: string; className?: string }) {
  return <span className={`bb-avatar ${className}`}>{initials}</span>
}

export function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: React.ReactNode }) {
  const modalRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    modalRef.current?.querySelector<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')?.focus()
    return () => previousActiveElement?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => !element.hasAttribute('disabled'))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return <div className="bb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section ref={modalRef} className="bb-modal" role="dialog" aria-modal="true" aria-labelledby="bb-modal-title" onKeyDown={handleKeyDown}><button className="bb-modal-close" onClick={onClose} aria-label="Cerrar">×</button><span className="bb-eyebrow">BEAUTYMC</span><h2 id="bb-modal-title">{title}</h2>{description && <p className="bb-modal-description">{description}</p>}{children}</section></div>
}

export function AppointmentStatusDot({ status }: { status: string }) {
  return <span className={`bb-calendar-status ${statusClass[status] ?? ''}`}><i aria-hidden="true" />{status}</span>
}

export function FilterDropdown({
  icon: Icon,
  value,
  options,
  onChange,
  label,
}: {
  icon: LucideIcon
  value: string
  options: string[]
  onChange: (value: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="bb-dropdown" ref={ref}>
      <button
        type="button"
        className="bb-dropdown-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon aria-hidden="true" />
        <span>{value}</span>
        <ChevronDown aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <ul className="bb-dropdown-list" role="listbox" aria-label={label}>
          {options.map((option) => {
            const selected = option === value
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={selected ? 'is-selected' : ''}
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                >
                  <span>{option}</span>
                  {selected && <Check aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
