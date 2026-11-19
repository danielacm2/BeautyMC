'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, EyeOff } from 'lucide-react'
import { isValidEmail } from '@/lib/validation'

type FieldErrors = { email?: string; password?: string }

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email.trim()) errors.email = 'Escribe tu correo electrónico.'
  else if (!isValidEmail(email.trim())) errors.email = 'Introduce un correo válido, por ejemplo nombre@dominio.com.'
  if (!password) errors.password = 'Escribe tu contraseña.'
  return errors
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [demoNotice, setDemoNotice] = useState(false)
  const [forgotNotice, setForgotNotice] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setDemoNotice(false)
    setForgotNotice(false)
    const found = validate(email, password)
    setErrors(found)
    if (found.email) return emailRef.current?.focus()
    if (found.password) return passwordRef.current?.focus()
    // Prototipo: aquí irá la autenticación real. Por ahora solo simulamos la comprobación.
    setSubmitting(true)
    timer.current = window.setTimeout(() => { setSubmitting(false); setDemoNotice(true) }, 900)
  }

  return <div className="login-card">
    <Link href="/" className="back-link login-back"><ArrowLeft size={16}/> Volver al inicio</Link>
    <div className="login-intro">
      <span className="eyebrow">ACCESO PARA EL EQUIPO</span>
      <h1>Te damos la<br/><em>bienvenida.</em></h1>
      <p className="login-lead">Accede a tu espacio de administración o de profesional.</p>
    </div>
    <form className="login-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <div className="login-field">
        <label htmlFor="login-email">Correo electrónico</label>
        <input ref={emailRef} id="login-email" name="email" type="email" inputMode="email" autoComplete="username" placeholder="nombre@example.com" value={email} onChange={(event) => { setEmail(event.target.value); if (errors.email) setErrors((current) => ({ ...current, email: undefined })) }} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'login-email-error' : undefined} disabled={submitting}/>
        {errors.email && <p className="login-error" id="login-email-error" role="alert">{errors.email}</p>}
      </div>
      <div className="login-field">
        <label htmlFor="login-password">Contraseña</label>
        <div className="login-password">
          <input ref={passwordRef} id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Tu contraseña" value={password} onChange={(event) => { setPassword(event.target.value); if (errors.password) setErrors((current) => ({ ...current, password: undefined })) }} aria-invalid={errors.password ? true : undefined} aria-describedby={errors.password ? 'login-password-error' : undefined} disabled={submitting}/>
          <button type="button" className="login-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} aria-controls="login-password">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
        </div>
        {errors.password && <p className="login-error" id="login-password-error" role="alert">{errors.password}</p>}
        <div className="login-forgot-row"><button type="button" className="login-forgot" onClick={() => { setDemoNotice(false); setForgotNotice(true) }}>¿Olvidaste tu contraseña?</button></div>
      </div>
      <button type="submit" className="button login-submit" disabled={submitting}>{submitting ? 'Comprobando…' : 'Iniciar sesión'} {!submitting && <ArrowRight size={16}/>}</button>
      <div className="login-status" role="status">{forgotNotice && <p className="login-notice">La recuperación de contraseña todavía no está activada. Esto es una demostración: contacta con la administración del estudio.</p>}{demoNotice && <p className="login-notice">La autenticación real todavía no está activada. Esto es una demostración: no se ha iniciado ninguna sesión.</p>}</div>
    </form>
    <p className="login-help">¿Problemas para entrar? Contacta con la administración del estudio.</p>
    <div className="login-demo" aria-labelledby="login-demo-title">
      <span className="eyebrow" id="login-demo-title">EXPLORA SIN INICIAR SESIÓN</span>
      <div className="login-demo-links"><Link href="/admin" className="login-demo-pill">Ver demo de administración <ArrowUpRight size={15}/></Link><Link href="/profesional" className="login-demo-pill">Ver demo de profesional <ArrowUpRight size={15}/></Link></div>
    </div>
  </div>
}
