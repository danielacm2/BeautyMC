'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock3 } from 'lucide-react'

const TIME_HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const TIME_MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))
const TIME_PERIODS = ['a.m.', 'p.m.']

export function parseDisplayTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*([ap])\.?m\.?$/i)
  if (!match) return null
  return { hour: match[1].padStart(2, '0'), minute: match[2], period: match[3].toLowerCase() === 'p' ? 'p.m.' : 'a.m.' }
}

export function TimePicker({
  value,
  onChange,
  label,
  placeholder = '--:--',
  align = 'left',
}: {
  value: string
  onChange: (display: string) => void
  label: string
  placeholder?: string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])
  const parsed = parseDisplayTime(value)
  function select(part: 'hour' | 'minute' | 'period', partValue: string) {
    const current = parsed ?? { hour: '10', minute: '00', period: 'a.m.' }
    const next = { ...current, [part]: partValue }
    onChange(`${next.hour}:${next.minute} ${next.period}`)
  }
  return (
    <div className="bb-timepicker" ref={ref}>
      <button
        type="button"
        className="bb-timepicker-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? '' : 'is-empty'}>{value || placeholder}</span>
        <Clock3 aria-hidden="true" />
      </button>
      {open && (
        <div className={`bb-timepicker-panel${align === 'right' ? ' is-right' : ''}`} role="listbox" aria-label={label}>
          <div className="bb-timepicker-col" aria-label="Hora">
            {TIME_HOURS.map((hour) => (
              <button
                key={hour}
                type="button"
                role="option"
                aria-selected={parsed?.hour === hour}
                className={parsed?.hour === hour ? 'is-selected' : ''}
                onClick={() => select('hour', hour)}
              >
                {hour}
              </button>
            ))}
          </div>
          <div className="bb-timepicker-col" aria-label="Minutos">
            {TIME_MINUTES.map((minute) => (
              <button
                key={minute}
                type="button"
                role="option"
                aria-selected={parsed?.minute === minute}
                className={parsed?.minute === minute ? 'is-selected' : ''}
                onClick={() => select('minute', minute)}
              >
                {minute}
              </button>
            ))}
          </div>
          <div className="bb-timepicker-col" aria-label="Periodo">
            {TIME_PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                role="option"
                aria-selected={parsed?.period === period}
                className={parsed?.period === period ? 'is-selected' : ''}
                onClick={() => select('period', period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
