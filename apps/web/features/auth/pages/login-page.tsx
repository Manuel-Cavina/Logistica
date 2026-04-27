'use client';

import { useState } from 'react';
import Link from 'next/link';

export function LoginPageView() {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="auth-wrap">

      {/* LEFT — panel de marca */}
      <div className="auth-left">
        <Link className="auth-brand" href="/">
          <div className="auth-brand-mark">R</div>
          <div className="auth-brand-word">Ruta<em> Directa</em></div>
        </Link>

        <div className="auth-quote">
          <div className="auth-quote-eyebrow"><span className="dot"></span>Bienvenido de vuelta</div>
          <h2>Tu próximo viaje<br />está a un <em>click.</em></h2>
          <p>Más de 1.200 traslados completados con transportistas verificados, pago protegido y comprobante digital.</p>
          <div className="auth-stats">
            <div className="auth-stat">
              <div className="auth-stat-n">+1.200</div>
              <div className="auth-stat-l">Viajes</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-n">+480</div>
              <div className="auth-stat-l">Camioneros</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-n">4.8★</div>
              <div className="auth-stat-l">Calificación</div>
            </div>
          </div>
        </div>

        <Link className="auth-foot-link" href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver al inicio
        </Link>
      </div>

      {/* RIGHT — formulario */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-head">
            <div className="auth-form-eyebrow">Iniciar sesión</div>
            <h1 className="auth-form-title">Hola de nuevo 👋</h1>
            <p className="auth-form-sub">¿Sos nuevo en Ruta Directa? <Link href="/register">Creá tu cuenta gratis</Link></p>
          </div>

          <div className="social-btns">
            <button type="button" className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
            <button type="button" className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continuar con Facebook
            </button>
          </div>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">o con email</span>
            <div className="divider-line"></div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label className="field-label">Email</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input type="email" className="field-input" placeholder="tu@email.com" required />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Contraseña</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input type={showPw ? 'text' : 'password'} className="field-input" placeholder="Tu contraseña" required />
                <button type="button" className="field-toggle" onClick={() => setShowPw(p => !p)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div className="field-row">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Mantener sesión iniciada
              </label>
              <span className="field-link">¿Olvidaste tu contraseña?</span>
            </div>

            <button type="submit" className="submit-btn">
              Ingresar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <div className="auth-help">
            ¿Necesitás ayuda? <a>Contactanos</a>
          </div>
        </div>
      </div>

    </div>
  );
}
