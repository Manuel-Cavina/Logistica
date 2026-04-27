'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'about' | 'routes' | 'trailer' | 'reviews';

const ROUTE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const ROUTES = [
  { route: 'Córdoba ↔ Buenos Aires', detail: '700 km · Frecuencia semanal' },
  { route: 'Córdoba ↔ Rosario', detail: '390 km · Frecuencia quincenal' },
  { route: 'Córdoba ↔ Mendoza', detail: '620 km · Frecuencia mensual' },
  { route: 'Córdoba ↔ Tucumán', detail: '540 km · Frecuencia mensual' },
  { route: 'Norte argentino', detail: 'Salta, Jujuy y NOA con coordinación previa' },
  { route: 'Otras rutas', detail: 'Consultá disponibilidad por WhatsApp' },
];

export function TransporterDetailPage() {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [modalOpen, setModalOpen] = useState(false);
  const [curStep, setCurStep] = useState(1);

  // Form state
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [cantidad, setCantidad] = useState('1 caballo');
  const [notas, setNotas] = useState('');

  const openModal = () => { setCurStep(1); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setCurStep(1); };
  const nextStep = () => {
    if (curStep === 4) { closeModal(); return; }
    setCurStep(s => s + 1);
  };

  const stepLabels: Record<number, string> = { 1: 'Siguiente →', 2: 'Revisar →', 3: 'Enviar propuesta →', 4: 'Cerrar' };

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

      {/* ═══ BREADCRUMB ═══ */}
      <div className="breadcrumb">
        <Link href="/">Inicio</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
        <a>Transportistas</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
        <a>Equinos</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
        <span>Jorge Ramírez</span>
      </div>

      {/* ═══ MAIN ═══ */}
      <div className="detail-wrap">

        {/* LEFT — perfil */}
        <div>

          {/* Cover */}
          <div className="profile-cover with-img">
            <div className="profile-cover-info">
              <div>
                <span className="profile-cover-tag">🚛 Transportista verificado</span>
                <div className="profile-cover-route">Cobertura nacional <em>·</em> Especialista equino</div>
                <div className="profile-cover-zone">📍 Base operativa: Córdoba Capital</div>
              </div>
              <button type="button" className="profile-cover-fav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          </div>

          {/* Identity block */}
          <div className="identity-block">
            <div className="identity-avatar">JR</div>
            <div className="identity-main">
              <div className="identity-name-row">
                <h1 className="identity-name">Jorge Ramírez</h1>
                <span className="identity-verified">✓ Verificado</span>
              </div>
              <div className="identity-meta">★ <strong>4.9</strong> · 84 viajes completados · 0 cancelaciones</div>
              <div className="identity-since">Miembro desde 2023 · DNI verificado · Licencia profesional vigente · Seguro de carga vigente</div>
              <div className="identity-stats">
                <div className="id-stat"><div className="id-stat-n">84</div><div className="id-stat-l">Viajes</div></div>
                <div className="id-stat"><div className="id-stat-n">10+</div><div className="id-stat-l">Años exp.</div></div>
                <div className="id-stat"><div className="id-stat-n">0</div><div className="id-stat-l">Cancela</div></div>
                <div className="id-stat"><div className="id-stat-n">24h</div><div className="id-stat-l">Responde</div></div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <div className="tabs-head">
              {(['about', 'routes', 'trailer', 'reviews'] as Tab[]).map((id, i) => (
                <button key={id} type="button" className={`tab${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>
                  {['Sobre mí', 'Rutas habituales', 'Trailer', 'Reseñas'][i]}
                </button>
              ))}
            </div>
            <div className="tab-body">

              {activeTab === 'about' && (
                <div className="desc-block">
                  <h3>Hola, soy Jorge</h3>
                  <p>Soy transportista de equinos hace más de 10 años. Trabajé con haras de alta gama, studs y centros ecuestres en todo el país. Mi base operativa es Córdoba Capital pero me muevo por todo el centro y norte de Argentina.</p>
                  <p>Cuento con trailer profesional especializado en equinos, totalmente equipado con piso antideslizante, ventilación regulable, separadores acolchados y monitoreo continuo durante el viaje. Todo viaje incluye seguro de carga hasta $5.000.000.</p>
                  <ul className="desc-list">
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Verificación manual completa</strong>DNI, licencia profesional, patente, seguro y fotos del trailer</div>
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Seguro de carga</strong>Hasta $5.000.000 por traslado</div>
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Atención permanente</strong>WhatsApp directo durante todo el viaje</div>
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Check-in y check-out con foto</strong>Evidencia visual al cargar y al entregar</div>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'routes' && (
                <div className="desc-block">
                  <h3>Rutas que cubro habitualmente</h3>
                  <p>Estas son las rutas en las que tengo más experiencia y donde puedo organizar viajes con mayor flexibilidad de fechas.</p>
                  <div className="routes-grid">
                    {ROUTES.map(({ route, detail }) => (
                      <div key={route} className="route-card">
                        <div className="route-card-icon">{ROUTE_ICON}</div>
                        <div className="route-card-text">
                          <strong>{route}</strong>
                          <p>{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: '18px', fontSize: '13px', color: 'var(--c5)', fontStyle: 'italic' }}>¿No encontrás tu ruta? Igual mandame la propuesta y vemos cómo coordinar.</p>
                </div>
              )}

              {activeTab === 'trailer' && (
                <div className="desc-block">
                  <h3>Mi trailer</h3>
                  <p>Trailer 2022 totalmente acondicionado para transporte equino profesional. Verificación técnica vigente y revisión periódica.</p>
                  <div className="spec-grid">
                    <div className="spec-row"><span className="spec-label">Capacidad</span><span className="spec-value">3 caballos</span></div>
                    <div className="spec-row"><span className="spec-label">Tipo trailer</span><span className="spec-value">Equino profesional</span></div>
                    <div className="spec-row"><span className="spec-label">Año modelo</span><span className="spec-value">2022</span></div>
                    <div className="spec-row"><span className="spec-label">Piso</span><span className="spec-value">Antideslizante</span></div>
                    <div className="spec-row"><span className="spec-label">Ventilación</span><span className="spec-value">Cruzada regulable</span></div>
                    <div className="spec-row"><span className="spec-label">Separadores</span><span className="spec-value">Acolchados</span></div>
                    <div className="spec-row"><span className="spec-label">Cámaras interiores</span><span className="spec-value">Sí, monitoreo continuo</span></div>
                    <div className="spec-row"><span className="spec-label">Iluminación</span><span className="spec-value">LED interior</span></div>
                    <div className="spec-row"><span className="spec-label">Ramp-load</span><span className="spec-value">Hidráulica</span></div>
                    <div className="spec-row"><span className="spec-label">Verificación</span><span className="spec-value">Vigente</span></div>
                    <div className="spec-row"><span className="spec-label">Seguro de carga</span><span className="spec-value">Hasta $5.000.000</span></div>
                    <div className="spec-row"><span className="spec-label">Patente</span><span className="spec-value">AC-XXX</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="desc-block">
                  <h3>Lo que dicen mis clientes</h3>
                  <div className="review-card">
                    <div className="review-head">
                      <div className="review-av">MA</div>
                      <div><div className="review-name">María Alfonzo</div><div className="review-date">Hace 2 semanas</div></div>
                      <div className="review-stars">★★★★★</div>
                    </div>
                    <span className="review-route">Salta → Bs. As.</span>
                    <p className="review-text">"Tres caballos llegaron impecables. Jorge avisó de cada parada, mandó fotos y fue muy claro con tiempos. Recomendado 100%."</p>
                  </div>
                  <div className="review-card">
                    <div className="review-head">
                      <div className="review-av" style={{ background: '#7A4A15' }}>CS</div>
                      <div><div className="review-name">Claudia Sosa · Haras Los Tilos</div><div className="review-date">Hace 1 mes</div></div>
                      <div className="review-stars">★★★★★</div>
                    </div>
                    <span className="review-route">Córdoba → Bs. As.</span>
                    <p className="review-text">"Trabajo con Jorge hace más de un año para los traslados del haras. Profesional, puntual y muy cuidadoso con los animales. Total confianza."</p>
                  </div>
                  <div className="review-card">
                    <div className="review-head">
                      <div className="review-av" style={{ background: '#163A5F' }}>DS</div>
                      <div><div className="review-name">Diego Sosa</div><div className="review-date">Hace 1 mes</div></div>
                      <div className="review-stars">★★★★★</div>
                    </div>
                    <span className="review-route">Tucumán → Córdoba</span>
                    <p className="review-text">"Excelente trato. Fotos al cargar, al parar y al descargar. La seña protegida me dio mucha tranquilidad. Volvería a contratarlo sin dudas."</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT — sidebar proponer viaje */}
        <aside className="book-sidebar">
          <div className="book-card">
            <div className="book-card-head">
              <span className="book-card-tag">📨 Proponer viaje</span>
              <h2 className="book-card-title">Contratá a Jorge</h2>
              <p className="book-card-sub">Completá los datos de tu traslado y Jorge te responde con la cotización en menos de 24hs.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); openModal(); }}>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Origen</label>
                  <input type="text" className="form-input" placeholder="Córdoba" value={origen} onChange={e => setOrigen(e.target.value)} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Destino</label>
                  <input type="text" className="form-input" placeholder="Buenos Aires" value={destino} onChange={e => setDestino(e.target.value)} required />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Fecha tentativa</label>
                  <input type="date" className="form-input" value={fecha} onChange={e => setFecha(e.target.value)} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Cantidad caballos</label>
                  <select className="form-input" value={cantidad} onChange={e => setCantidad(e.target.value)} required>
                    <option>1 caballo</option>
                    <option>2 caballos</option>
                    <option>3 caballos</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Notas para el transportista</label>
                <textarea className="form-input form-textarea" placeholder="Tipo de carga, horarios preferidos, particularidades del traslado..." value={notas} onChange={e => setNotas(e.target.value)} />
              </div>
              <button type="submit" className="book-btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                Enviar propuesta
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>

            <button type="button" className="book-btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Solo consultar disponibilidad
            </button>

            <div className="book-trust">
              <div className="book-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span><strong>Verificado manualmente</strong> · DNI, licencia y seguro</span>
              </div>
              <div className="book-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span><strong>Responde en 24h</strong> · Promedio 12h</span>
              </div>
              <div className="book-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                <span><strong>Pago protegido</strong> al confirmar el viaje</span>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* ═══ MODAL — flujo de propuesta ═══ */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">

            <div className="modal-head">
              <button type="button" className="modal-back" onClick={() => setCurStep(s => s - 1)} disabled={curStep === 1 || curStep === 4}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Volver
              </button>
              <button type="button" className="modal-close" onClick={closeModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="stepper">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className={`step${curStep === n ? ' active' : ''}${curStep > n ? ' done' : ''}`}>
                  <div className="step-circle">{curStep > n ? '✓' : n}</div>
                  <div className="step-label">{['Detalle', 'Revisar', 'Enviar', 'Espera'][n - 1]}</div>
                </div>
              ))}
            </div>

            <div className="modal-body">

              {/* PASO 1 */}
              {curStep === 1 && (
                <>
                  <h2 className="pane-title">Detalle de tu propuesta</h2>
                  <p className="pane-sub">Estos son los datos que le vas a enviar a Jorge.</p>
                  <div className="summary-card">
                    <div className="summary-row"><span className="label">Origen</span><span className="val">{origen || 'Córdoba Capital'}</span></div>
                    <div className="summary-row"><span className="label">Destino</span><span className="val">{destino || 'Buenos Aires'}</span></div>
                    <div className="summary-row"><span className="label">Fecha tentativa</span><span className="val">{fecha || 'Sáb 26 de abril'}</span></div>
                    <div className="summary-row"><span className="label">Cantidad</span><span className="val">{cantidad}</span></div>
                    <div className="summary-row"><span className="label">Distancia estimada</span><span className="val">700 km</span></div>
                  </div>
                  <div className="note-card">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <div className="note-card-text"><strong>¿Cómo continúa?</strong>Jorge recibe tu propuesta y te responde en menos de 24hs con cotización, condiciones y disponibilidad real.</div>
                  </div>
                </>
              )}

              {/* PASO 2 */}
              {curStep === 2 && (
                <>
                  <h2 className="pane-title">Mensaje al transportista</h2>
                  <p className="pane-sub">Editá si querés agregar algo más antes de enviar.</p>
                  <div className="form-field">
                    <label className="form-label">Mensaje para Jorge</label>
                    <textarea
                      className="form-input form-textarea"
                      style={{ minHeight: '140px' }}
                      defaultValue={`Hola Jorge, te quería proponer un traslado de ${cantidad} desde ${origen || 'Córdoba Capital'} a ${destino || 'Buenos Aires'} el ${fecha || 'sábado 26 de abril'}. Los caballos son tranquilos y no necesitan equipamiento especial. Quedo atento a tu cotización y disponibilidad. ¡Gracias!`}
                    />
                  </div>
                  <div className="note-card">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <div className="note-card-text"><strong>Tu identidad queda visible</strong>Jorge ve tu nombre, calificación y mensaje. Nada más hasta que confirmen ambos el traslado.</div>
                  </div>
                </>
              )}

              {/* PASO 3 */}
              {curStep === 3 && (
                <>
                  <h2 className="pane-title">Última revisión</h2>
                  <p className="pane-sub">Confirmá que todo está bien antes de enviar tu propuesta.</p>
                  <div className="summary-card">
                    <div className="summary-row"><span className="label">Para</span><span className="val">Jorge Ramírez ★ 4.9</span></div>
                    <div className="summary-row"><span className="label">Ruta</span><span className="val">{origen || 'Córdoba'} → {destino || 'Buenos Aires'}</span></div>
                    <div className="summary-row"><span className="label">Fecha</span><span className="val">{fecha || 'Sáb 26 abr'} · 700 km</span></div>
                    <div className="summary-row"><span className="label">Cantidad</span><span className="val">{cantidad}</span></div>
                    <div className="summary-row"><span className="label">Mensaje</span><span className="val" style={{ fontSize: '11px', color: 'var(--c5)' }}>Editado ✓</span></div>
                  </div>
                  <div className="note-card">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                    <div className="note-card-text"><strong>Sin compromiso aún</strong>Esto es solo una propuesta. Cuando Jorge te responda, vos decidís si avanzás con el pago de la seña.</div>
                  </div>
                </>
              )}

              {/* PASO 4 */}
              {curStep === 4 && (
                <>
                  <div className="sent-icon-wrap">
                    <div className="sent-circle">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </div>
                    <div className="sent-title">¡Propuesta enviada!</div>
                    <div className="sent-sub">Jorge ya tiene tu propuesta. Te va a responder en menos de 24hs con la cotización y disponibilidad real para esa fecha.</div>
                  </div>
                  <div className="summary-card" style={{ marginTop: '24px' }}>
                    <div className="summary-row"><span className="label">Estado</span><span className="val" style={{ color: '#a16207' }}>📨 Esperando respuesta</span></div>
                    <div className="summary-row"><span className="label">Tiempo estimado</span><span className="val">Menos de 24hs</span></div>
                    <div className="summary-row"><span className="label">ID de propuesta</span><span className="val" style={{ fontFamily: 'monospace', fontSize: '12px' }}>RD-PROP-04891</span></div>
                  </div>
                  <div className="note-card">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <div className="note-card-text"><strong>Te avisamos por email</strong>Cuando Jorge responda recibís un mail. También aparece en tu panel de propuestas.</div>
                  </div>
                </>
              )}

            </div>

            <div className="modal-foot">
              {curStep !== 4 && (
                <button type="button" className="modal-btn-ghost" onClick={closeModal}>Cancelar</button>
              )}
              <button type="button" className="modal-btn-primary" onClick={nextStep}>
                {stepLabels[curStep]}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand"><div className="logo-mark">R</div>Ruta Directa</div>
            <p className="footer-tag">El marketplace de transporte equino más confiable de Argentina.</p>
            <div className="footer-socials">
              <a className="fs">IG</a><a className="fs">FB</a><a className="fs">WA</a><a className="fs">YT</a>
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
            <ul><li><a>Preguntas frecuentes</a></li><li><a>Soporte</a></li><li><a>Contacto</a></li></ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul><li><a>Términos</a></li><li><a>Privacidad</a></li><li><a>Cancelaciones</a></li></ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Ruta Directa — Argentina</span>
          <div className="footer-legal"><a>Términos</a><a>Privacidad</a></div>
        </div>
      </footer>

    </div>
  );
}
