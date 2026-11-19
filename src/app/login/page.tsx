import type { Metadata } from 'next'
import Image from 'next/image'
import { SiteHeader, SiteFooter } from '@/components/beautybook/site-shell'
import LoginForm from '@/components/beautybook/login-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión | BeautyMC',
  description: 'Acceso para el equipo de BeautyMC: administración y profesionales.',
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="login-page">
        <div className="login-visual" aria-hidden="true">
          <div className="login-arch-frame">
            <div className="login-arch-outline" />
            <div className="login-arch">
              <Image
                src="/beautybook-interior.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 960px) 0px, 560px"
              />
              <div className="login-visual-caption">
                <span className="eyebrow">BEAUTYMC STUDIO</span>
                <p>
                  Un momento
                  <br />
                  <em>solo para ti.</em>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="login-panel">
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
