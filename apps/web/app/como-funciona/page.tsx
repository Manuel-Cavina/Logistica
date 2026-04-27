'use client';

import Link from 'next/link';

export default function ComoFunciona() {
  return (
    <div style={{ background: 'var(--c2)', fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", color: 'var(--ink)', fontSize: '14px', lineHeight: '1.5' }}>

      {/* ═══ NAV ═══ */}
      <nav>
        <div className="nav-inner">
          <Link className="nav-logo" href="/">
            <div className="logo-mark">R</div>
            <div className="logo-word">Ruta<em> Directa</em></div>
          </Link>
          <div className="nav-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Buscá tu próximo viaje · Córdoba → Buenos Aires..." />
            <button type="button" className="nav-search-btn">Buscar</button>
          </div>
          <div className="nav-actions">
            <a className="nav-link">Publicar</a>
            <Link className="nav-link" href="/login">Ingresá</Link>
            <Link className="nav-cta" href="/register">Registrate</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="cf-hero">
        <div className="cf-hero-inner">
          <div className="cf-eyebrow"><span className="dot"></span>Cómo funciona</div>
          <h1>Reservar transporte equino<br />nunca fue tan <em>simple.</em></h1>
          <p>Encontrá viajes con cupos disponibles, reservá tu lugar con seña protegida y coordiná directamente con transportistas verificados. Todo desde un solo lugar, con respaldo y comprobante digital.</p>
          <div className="cf-hero-actions">
            <Link className="cf-btn-primary" href="/">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Buscar viajes
            </Link>
            <Link className="cf-btn-secondary" href="/register">Soy transportista →</Link>
          </div>
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <div className="cf-trust">
        <div className="cf-trust-inner">
          <div className="cf-trust-item">
            <div className="cf-trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="cf-trust-text"><strong>Verificación manual</strong><span>Cada transportista revisado</span></div>
          </div>
          <div className="cf-trust-item">
            <div className="cf-trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <div className="cf-trust-text"><strong>Pago protegido</strong><span>Seña retenida hasta entrega</span></div>
          </div>
          <div className="cf-trust-item">
            <div className="cf-trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </div>
            <div className="cf-trust-text"><strong>Comprobante digital</strong><span>PDF al finalizar</span></div>
          </div>
          <div className="cf-trust-item">
            <div className="cf-trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div className="cf-trust-text"><strong>Cancelación gratis</strong><span>Hasta 24hs antes</span></div>
          </div>
        </div>
      </div>

      {/* ═══ DUAL FLOWS ═══ */}
      <section className="section">
        <div className="section-eyebrow">El proceso</div>
        <h2 className="cf-section-title">Funciona para los <em>dos lados</em><br />del transporte equino.</h2>
        <p className="cf-section-sub">Sea que tengas caballos para mover o que seas transportista con cupos vacíos, el proceso es claro y sin sorpresas.</p>

        <div className="flow-grid">

          <div className="flow-col client-flow">
            <div className="flow-col-tag">🐴 Si tenés que trasladar</div>
            <h3 className="flow-col-title">Para clientes</h3>
            <div className="flow-step">
              <div className="flow-num">1</div>
              <div className="flow-step-text">
                <strong>Buscá tu viaje</strong>
                <p>Filtrá por origen, destino, fecha y cantidad de cupos. Solo ves transportistas verificados.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">2</div>
              <div className="flow-step-text">
                <strong>Elegí y reservá</strong>
                <p>Mirá el detalle, condiciones, transportista y precio. Reservá los cupos que necesites.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">3</div>
              <div className="flow-step-text">
                <strong>Pagá la seña (20%)</strong>
                <p>Tu dinero queda protegido. Solo se libera al transportista cuando confirmás la entrega.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">4</div>
              <div className="flow-step-text">
                <strong>Coordiná por chat</strong>
                <p>WhatsApp directo o chat interno con el transportista. Recibís fotos del check-in y check-out.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">5</div>
              <div className="flow-step-text">
                <strong>Confirmá y calificá</strong>
                <p>Cuando llegue todo bien, confirmás y se libera el pago. Calificás al transportista.</p>
              </div>
            </div>
          </div>

          <div className="flow-col driver-flow">
            <div className="flow-col-tag driver">🚛 Si transportás</div>
            <h3 className="flow-col-title">Para camioneros</h3>
            <div className="flow-step">
              <div className="flow-num">1</div>
              <div className="flow-step-text">
                <strong>Registrate y verificate</strong>
                <p>DNI, licencia, patente, fotos del trailer y seguro. Verificación manual en menos de 24hs.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">2</div>
              <div className="flow-step-text">
                <strong>Publicá tu viaje</strong>
                <p>Definí ruta, fecha, cupos disponibles, precio por cupo y condiciones. En 5 minutos online.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">3</div>
              <div className="flow-step-text">
                <strong>Recibí reservas con seña</strong>
                <p>Cada reserva incluye 20% de seña pagada. Llegás al día del viaje con cupos confirmados.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">4</div>
              <div className="flow-step-text">
                <strong>Hacé check-in y check-out</strong>
                <p>Subís fotos al cargar y al entregar. Esto te protege ante cualquier reclamo.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-num">5</div>
              <div className="flow-step-text">
                <strong>Cobrá el saldo</strong>
                <p>Cuando el cliente confirma la entrega, recibís el pago completo. Tu reputación crece con cada viaje.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ TRUST CARDS ═══ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-eyebrow">¿Por qué elegirnos?</div>
        <h2 className="cf-section-title">Pensado para <em>resolver</em> los problemas reales del transporte equino.</h2>
        <div className="cf-trust-grid">
          <div className="trust-card">
            <div className="trust-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Verificación de verdad</h3>
            <p>Cada transportista pasa por verificación manual: DNI, licencia profesional, fotos del trailer, seguro vigente. No es solo un formulario.</p>
          </div>
          <div className="trust-card">
            <div className="trust-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <h3>Pago siempre protegido</h3>
            <p>La seña queda retenida hasta que vos confirmás que la carga llegó bien. Si hay un problema, el dinero no se libera.</p>
          </div>
          <div className="trust-card">
            <div className="trust-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </div>
            <h3>Comprobante oficial</h3>
            <p>Generamos un PDF con todos los datos del traslado, las partes, el monto y las condiciones. Vale como respaldo.</p>
          </div>
          <div className="trust-card">
            <div className="trust-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3>Cancelación clara</h3>
            <p>Hasta 24hs antes del viaje cancelás sin costo y recuperás el 100% de la seña. Sin letra chica.</p>
          </div>
          <div className="trust-card">
            <div className="trust-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Chat sin intermediarios</h3>
            <p>Hablás directo con el transportista. WhatsApp o chat interno. Coordinás todo lo que necesites.</p>
          </div>
          <div className="trust-card">
            <div className="trust-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>
            </div>
            <h3>Reputación real</h3>
            <p>Cada viaje completado deja calificación de las dos partes. La trayectoria se acumula y se ve.</p>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIOS ═══ */}
      <section className="testi-section">
        <div className="testi-inner">
          <div className="section-eyebrow">Lo que dicen</div>
          <h2 className="cf-section-title">Cientos de traslados, <em>cero</em> sorpresas.</h2>
          <div className="testi-grid">
            <div className="testi-card">
              <div className="testi-stars">★ ★ ★ ★ ★</div>
              <div className="testi-text">"Tenía que trasladar tres caballos de Salta a Buenos Aires y siempre me daba miedo. Acá fue todo claro: vi al transportista verificado, pagué la seña y me llegaron fotos en cada momento."</div>
              <div className="testi-author">
                <div className="testi-av">MA</div>
                <div>
                  <div className="testi-name">María Alfonzo</div>
                  <div className="testi-role">Cliente · Salta</div>
                </div>
              </div>
              <div className="testi-result">+ Ahorró 30% vs cotización particular</div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★ ★ ★ ★ ★</div>
              <div className="testi-text">"Soy camionero hace 12 años. Antes los retornos quedaban vacíos. Acá publico el viaje y llego con cupos vendidos. Los pagos llegan en tiempo, sin perseguir a nadie."</div>
              <div className="testi-author">
                <div className="testi-av">JR</div>
                <div>
                  <div className="testi-name">Jorge Ramírez</div>
                  <div className="testi-role">Transportista · Córdoba</div>
                </div>
              </div>
              <div className="testi-result">+ 40% más viajes completos al mes</div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★ ★ ★ ★ ★</div>
              <div className="testi-text">"Coordinaba por WhatsApp y siempre había algún malentendido. Con el comprobante PDF tengo todo claro: ruta, condiciones, precio. Para mi haras es indispensable."</div>
              <div className="testi-author">
                <div className="testi-av">CS</div>
                <div>
                  <div className="testi-name">Claudia Sosa</div>
                  <div className="testi-role">Haras · Buenos Aires</div>
                </div>
              </div>
              <div className="testi-result">+ Cero disputas en 6 meses</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="cta-final">
        <div className="cta-inner">
          <div className="cta-tag"><span className="dot"></span>Listo para probar</div>
          <h2>¿Seguís coordinando<br />traslados por <em>WhatsApp?</em></h2>
          <p>Probá Ruta Directa gratis. Crear cuenta toma 2 minutos y ya podés buscar viajes con transportistas verificados.</p>
          <div className="cta-actions">
            <Link className="cta-btn-pri" href="/register">
              Crear cuenta gratis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link className="cta-btn-sec" href="/">Ver viajes disponibles</Link>
          </div>
          <div className="cta-proof">
            <span>✓ Sin tarjeta</span>
            <span>✓ Sin permanencia</span>
            <span>✓ +1.200 viajes completados</span>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <div className="logo-mark">R</div>
              Ruta Directa
            </div>
            <p className="footer-tag">El marketplace de transporte equino más confiable de Argentina.</p>
            <div className="footer-socials">
              <a className="fs">IG</a>
              <a className="fs">FB</a>
              <a className="fs">WA</a>
              <a className="fs">YT</a>
            </div>
          </div>
          <div className="footer-col">
            <h5>Plataforma</h5>
            <ul>
              <li><Link href="/">Buscar viajes</Link></li>
              <li><a>Para camioneros</a></li>
              <li><Link href="/como-funciona">Cómo funciona</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Ayuda</h5>
            <ul>
              <li><a>Preguntas frecuentes</a></li>
              <li><a>Soporte</a></li>
              <li><a>Contacto</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a>Términos</a></li>
              <li><a>Privacidad</a></li>
              <li><a>Cancelaciones</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Ruta Directa — Argentina</span>
          <div className="footer-legal">
            <a>Términos</a>
            <a>Privacidad</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
