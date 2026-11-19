'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { BadgeCheck, Camera, Check, Clock3, Heart } from 'lucide-react'
import { PROFESSIONAL_NAME } from '@/components/beautybook/professional/professional-shared'

export function MyProfile({ notify }: { notify: (message: string) => void }) {
  const [saved, setSaved] = useState(false)
  const [bio, setBio] = useState(
    'Me encanta crear looks naturales y encontrar el estilo que mejor encaja contigo. Especialista en corte, color y cuidado capilar.',
  )
  const savedTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (savedTimer.current !== null) window.clearTimeout(savedTimer.current)
    }
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    notify('Tu perfil se ha actualizado en esta vista de muestra.')
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => setSaved(false), 2400)
  }

  return (
    <div className="bb-page-stack">
      <section className="bb-citas-hero">
        <div className="bb-welcome-text">
          <div className="bb-welcome-eyebrow-row">
            <span className="bb-eyebrow">PERFIL PROFESIONAL</span>
            <span className="bb-dot-sep" aria-hidden="true" />
            <span className="bb-shift-badge">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C59]" />
              </span>
              VISIBLE EN RESERVAS
            </span>
          </div>
          <h2>Mi perfil</h2>
          <p>Mantén tu información profesional, especialidades y presentación al día.</p>
        </div>
        <div className="bb-citas-hero-side">
          <div className="bb-citas-capsule">
            <div className="bb-citas-metric">
              <span>ESPECIALIDAD</span>
              <strong className="bb-capsule-serif">Peluquería & color</strong>
            </div>
            <div className="bb-citas-capsule-div" aria-hidden="true" />
            <div className="bb-citas-metric">
              <span>EN EL EQUIPO</span>
              <strong className="bb-capsule-serif">Desde Mar 2021</strong>
            </div>
            <div className="bb-citas-capsule-div" aria-hidden="true" />
            <div className="bb-citas-metric">
              <span>SERVICIOS ACTIVOS</span>
              <strong>4</strong>
            </div>
          </div>
        </div>
        <div className="bb-welcome-giant" aria-hidden="true">
          b
        </div>
      </section>
      <div className="bb-profile-layout">
        <form className="bb-panel bb-profile-form" onSubmit={submit}>
          <div className="bb-profile-top">
            <div className="bb-profile-photo">
              <Image src="/professional-laura.jpg" alt="Retrato de muestra de Laura Martín" fill sizes="96px" />
              <span className="bb-avatar-camera" aria-hidden="true">
                <Camera size={12} />
              </span>
            </div>
            <div className="bb-profile-heading">
              <div className="bb-profile-name-row">
                <strong>{PROFESSIONAL_NAME}</strong>
                <span className="bb-verified-pill">
                  <BadgeCheck size={13} aria-hidden="true" />
                  Perfil verificado
                </span>
              </div>
              <small>Profesional senior · BeautyMC Studio Medellín</small>
            </div>
          </div>

          <div className="bb-settings-fields">
            <div className="bb-form-row">
              <label>
                Nombre
                <input defaultValue="Laura" />
              </label>
              <label>
                Apellidos
                <input defaultValue="Martín" />
              </label>
            </div>
            <div className="bb-form-row">
              <label>
                Correo electrónico
                <input type="email" defaultValue="laura.martin@example.com" />
              </label>
              <label>
                Teléfono / WhatsApp
                <input type="tel" defaultValue="+57 300 000 0000" />
              </label>
            </div>

            <div className="bb-services-block">
              <div className="bb-services-head">
                <span>Sobre mí</span>
                <small>{bio.length} / 280 caracteres</small>
              </div>
              <textarea rows={4} maxLength={280} value={bio} onChange={(event) => setBio(event.target.value)} />
            </div>
          </div>

          <div className="bb-profile-foot">
            {/* prettier-ignore */}
            <span>
              <Clock3 size={13} aria-hidden="true" /> Última actualización:{' '}
              {saved ? 'ahora mismo' : 'hoy, 18:30'}
            </span>
            <button type="submit" className="bb-button bb-button-primary">
              <Check size={15} aria-hidden="true" />
              Guardar cambios
            </button>
          </div>
        </form>

        <aside className="bb-panel bb-profile-side">
          <div className="bb-profile-side-icon">
            <Heart />
          </div>
          <span className="bb-eyebrow">TU PERFIL EN BEAUTYMC</span>
          <h2>
            Tu experiencia,
            <br />
            <em>tu sello personal.</em>
          </h2>
          <p>Comparte con tus clientas qué te inspira y qué pueden esperar de su cita contigo.</p>
          <div className="bb-side-stats">
            <div>
              <span>TRAYECTORIA</span>
              <strong>5 años en el estudio</strong>
            </div>
            <div>
              <span>TURNO HABITUAL</span>
              <strong>Lun — Sáb</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
