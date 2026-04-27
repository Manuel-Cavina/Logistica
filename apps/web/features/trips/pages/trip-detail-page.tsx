'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'desc' | 'spec' | 'cond' | 'drv';

const IMAGES = [
  'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5b?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80&auto=format&fit=crop',
];

const PRICE = 85000;
const MAX_CUPOS = 3;

function fmt(n: number) {
  return '$' + n.toLocaleString('es-AR');
}

export function TripDetailPage() {
  const [curImg, setCurImg] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('desc');
  const [cupos, setCupos] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [curStep, setCurStep] = useState(1);
  const [mCupos, setMCupos] = useState(1);
  const [chatSelected, setChatSelected] = useState<'wsp' | 'app'>('app');
  const [confC, setConfC] = useState(false);
  const [confD, setConfD] = useState(false);

  const sub = PRICE * cupos;
  const senaSide = Math.round(sub * 0.2);

  const mSub = PRICE * mCupos;
  const mSenaAmt = Math.round(mSub * 0.2);
  const mSaldo = mSub - mSenaAmt;

  const changeImg = (d: number) => setCurImg(i => (i + d + IMAGES.length) % IMAGES.length);

  const openModal = () => {
    setMCupos(cupos);
    setCurStep(1);
    setConfC(false);
    setConfD(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurStep(1);
    setConfC(false);
    setConfD(false);
  };

  const nextStep = () => {
    if (curStep === 5) { closeModal(); return; }
    setCurStep(s => s + 1);
  };

  const handleConfirm = (role: 'C' | 'D') => {
    const nc = role === 'C' ? true : confC;
    const nd = role === 'D' ? true : confD;
    if (role === 'C') setConfC(true);
    else setConfD(true);
    if (nc && nd) setTimeout(() => setCurStep(5), 1000);
  };

  const stepLabel: Record<number, string> = {
    1: 'Continuar →',
    2: 'Pagar seña →',
    3: 'Continuar →',
    5: 'Descargar comprobante PDF',
  };

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
        <a>Viajes</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
        <a>Equinos</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
        <span>Córdoba → Buenos Aires</span>
      </div>

      {/* ═══ MAIN ═══ */}
      <div className="detail-wrap">

        {/* LEFT — galería + contenido */}
        <div>

          {/* Galería */}
          <div className="gallery">
            <div className="gal-main">
              <span className="gal-tag">15% OFF</span>
              <button type="button" className="gal-fav">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              {IMAGES.map((src, i) => (
                <div key={i} className={`gal-main-img${curImg === i ? ' active' : ''}`} style={{ backgroundImage: `url('${src}')` }} />
              ))}
              <div className="gal-overlay" />
              <div className="gal-route-overlay">
                <div className="gal-from-to">Córdoba <em>→</em> Buenos Aires</div>
                <div className="gal-meta-line">700 km · Sábado 26 de abril · Salida 07:00 hs</div>
              </div>
              <div className="gal-arrows gal-arrow-l">
                <button type="button" className="gal-arrow-btn" onClick={() => changeImg(-1)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
                </button>
              </div>
              <div className="gal-arrows gal-arrow-r">
                <button type="button" className="gal-arrow-btn" onClick={() => changeImg(1)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
            <div className="gal-thumbs">
              {IMAGES.map((src, i) => (
                <div
                  key={i}
                  className={`gal-thumb${curImg === i ? ' active' : ''}`}
                  onClick={() => setCurImg(i)}
                  style={{ backgroundImage: `url('${src.replace('w=1600', 'w=200')}')` }}
                />
              ))}
            </div>
          </div>

          {/* Title block */}
          <div className="title-block">
            <div className="tb-tag-row">
              <span className="tb-tag">🐴 Equinos</span>
              <span className="tb-tag tb-tag-orange">15% OFF</span>
              <span className="tb-status"><span className="live-dot"></span>Disponible ahora</span>
            </div>
            <h1 className="tb-title">Traslado de equinos · Córdoba a Buenos Aires</h1>
            <div className="tb-loc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Salida desde Córdoba Capital · Llegada Capital Federal
            </div>
            <div className="tb-quick-grid">
              <div className="tb-quick-item">
                <div className="tb-quick-label">Distancia</div>
                <div className="tb-quick-value">700 km</div>
                <div className="tb-quick-sub">Ruta directa</div>
              </div>
              <div className="tb-quick-item">
                <div className="tb-quick-label">Cupos libres</div>
                <div className="tb-quick-value sage">3 de 3</div>
                <div className="tb-quick-sub">Sin reservas aún</div>
              </div>
              <div className="tb-quick-item">
                <div className="tb-quick-label">Desvío máximo</div>
                <div className="tb-quick-value">50 km</div>
                <div className="tb-quick-sub">Configurable</div>
              </div>
              <div className="tb-quick-item">
                <div className="tb-quick-label">Tipo carga</div>
                <div className="tb-quick-value">Equinos</div>
                <div className="tb-quick-sub">Hasta 3 caballos</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <div className="tabs-head">
              {(['desc', 'spec', 'cond', 'drv'] as Tab[]).map((id, i) => (
                <button
                  key={id}
                  type="button"
                  className={`tab${activeTab === id ? ' active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  {['Descripción', 'Características', 'Condiciones', 'Transportista'][i]}
                </button>
              ))}
            </div>
            <div className="tab-body">

              {activeTab === 'desc' && (
                <div className="desc-block">
                  <h3>Sobre este viaje</h3>
                  <p>Viaje directo Córdoba Capital a Buenos Aires Capital con trailer profesional especializado en transporte equino. Salida temprano para llegar el mismo día. El trailer cuenta con piso antideslizante, ventilación cruzada, separadores acolchados y sistema de aireación regulable.</p>
                  <p>Jorge es transportista hace más de 10 años, especializado en equinos de alta competición. Trabajó con haras, studs y centros ecuestres de todo el país. El viaje incluye seguro de carga y atención permanente durante todo el traslado.</p>
                  <ul className="desc-list">
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Seguro de carga incluido</strong>Cubre hasta $5.000.000 por traslado</div>
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Trailer especializado equino</strong>Piso antideslizante, ventilación regulable, separadores</div>
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Check-in y check-out con foto</strong>Recibís evidencia visual al cargar y al entregar</div>
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                      <div><strong>Atención durante el viaje</strong>Chat disponible 24/7 con el transportista</div>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'spec' && (
                <div className="desc-block">
                  <h3>Características del trailer</h3>
                  <div className="spec-grid">
                    <div className="spec-row"><span className="spec-label">Capacidad</span><span className="spec-value">3 caballos</span></div>
                    <div className="spec-row"><span className="spec-label">Tipo trailer</span><span className="spec-value">Para equinos</span></div>
                    <div className="spec-row"><span className="spec-label">Año modelo</span><span className="spec-value">2022</span></div>
                    <div className="spec-row"><span className="spec-label">Piso</span><span className="spec-value">Antideslizante</span></div>
                    <div className="spec-row"><span className="spec-label">Ventilación</span><span className="spec-value">Cruzada regulable</span></div>
                    <div className="spec-row"><span className="spec-label">Separadores</span><span className="spec-value">Acolchados</span></div>
                    <div className="spec-row"><span className="spec-label">Sistema aireación</span><span className="spec-value">Regulable</span></div>
                    <div className="spec-row"><span className="spec-label">Iluminación interior</span><span className="spec-value">LED</span></div>
                    <div className="spec-row"><span className="spec-label">Cámaras</span><span className="spec-value">Sí, monitoreo continuo</span></div>
                    <div className="spec-row"><span className="spec-label">Ramp-load</span><span className="spec-value">Hidráulica</span></div>
                    <div className="spec-row"><span className="spec-label">Verificación trailer</span><span className="spec-value">Vigente</span></div>
                    <div className="spec-row"><span className="spec-label">Patente</span><span className="spec-value">AC-XXX</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'cond' && (
                <div className="desc-block">
                  <h3>Condiciones del viaje</h3>
                  <div className="cond-grid">
                    <div className="cond-item">
                      <div className="cond-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
                      <div className="cond-text"><strong>Cancelación gratuita 24hs antes</strong><p>100% de la seña reembolsada si cancelás con anticipación</p></div>
                    </div>
                    <div className="cond-item">
                      <div className="cond-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></div>
                      <div className="cond-text"><strong>Seña 20% al reservar</strong><p>Saldo restante antes de la salida del transporte</p></div>
                    </div>
                    <div className="cond-item">
                      <div className="cond-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                      <div className="cond-text"><strong>Pago protegido</strong><p>Dinero retenido hasta confirmación de entrega</p></div>
                    </div>
                    <div className="cond-item">
                      <div className="cond-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></div>
                      <div className="cond-text"><strong>Comprobante PDF</strong><p>Documentación oficial del traslado al finalizar</p></div>
                    </div>
                    <div className="cond-item">
                      <div className="cond-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                      <div className="cond-text"><strong>Chat con transportista</strong><p>Coordinación directa por WhatsApp o chat interno</p></div>
                    </div>
                    <div className="cond-item">
                      <div className="cond-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
                      <div className="cond-text"><strong>Reportar problema</strong><p>Botón directo si hay incidentes durante el viaje</p></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'drv' && (
                <div className="desc-block">
                  <div className="driver-block">
                    <div className="driver-avatar">JR</div>
                    <div className="driver-info">
                      <h4>Jorge Ramírez <span className="driver-verified">✓ Verificado</span></h4>
                      <div className="driver-rating">★ <strong>4.9</strong> · 84 viajes completados · 0 cancelaciones</div>
                      <div className="driver-since">Miembro desde 2023 · DNI verificado · Licencia profesional vigente</div>
                    </div>
                  </div>
                  <div className="driver-stats-row">
                    <div className="driver-stat"><div className="driver-stat-n">84</div><div className="driver-stat-l">Viajes</div></div>
                    <div className="driver-stat"><div className="driver-stat-n">10+</div><div className="driver-stat-l">Años exp.</div></div>
                    <div className="driver-stat"><div className="driver-stat-n">0</div><div className="driver-stat-l">Cancelaciones</div></div>
                  </div>
                  <p style={{ marginTop: '18px', fontSize: '14px', color: 'var(--ink-soft)', lineHeight: '1.75' }}>Especialista en transporte equino con más de 10 años de experiencia. Trabajó con haras de alta gama, studs y centros ecuestres en todo el país. Cobertura por todo el norte y centro de Argentina.</p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT — sidebar sticky */}
        <aside className="book-sidebar">
          <div className="book-card">
            <div className="book-price-old"><s>{fmt(100000)}</s><span className="book-price-off">15% OFF</span></div>
            <div className="book-price-row">
              <div className="book-price">{fmt(PRICE)}</div>
            </div>
            <div className="book-price-sub">por cupo · seña {fmt(Math.round(PRICE * 0.2))}</div>

            <div className="book-cupos-row">
              <span className="book-cupos-label">Cupos disponibles</span>
              <span className="book-cupos-n">{MAX_CUPOS}</span>
            </div>

            <div className="cupos-selector">
              <span className="cs-label">¿Cuántos cupos necesitás?</span>
              <div className="cs-row">
                <button type="button" className="cs-btn" onClick={() => setCupos(c => Math.max(1, c - 1))}>−</button>
                <span className="cs-num">{cupos}</span>
                <button type="button" className="cs-btn" onClick={() => setCupos(c => Math.min(MAX_CUPOS, c + 1))}>+</button>
                <span className="cs-max">de {MAX_CUPOS} disponibles</span>
              </div>
            </div>

            <div className="totals-block">
              <div className="totals-row"><span>Precio por cupo</span><span className="totals-val">{fmt(PRICE)}</span></div>
              <div className="totals-row"><span>Cupos × {cupos}</span><span className="totals-val">{fmt(sub)}</span></div>
              <div className="totals-row big"><span>Total</span><span className="totals-val">{fmt(sub)}</span></div>
              <div className="totals-row"><span>Seña a pagar (20%)</span><span className="totals-val" style={{ color: 'var(--c4-dark)' }}>{fmt(senaSide)}</span></div>
            </div>

            <button type="button" className="book-btn-primary" onClick={openModal}>Reservar viaje</button>
            <button type="button" className="book-btn-secondary">💬 Consultar al transportista</button>

            <div className="book-trust">
              <div className="book-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span><strong>Pago protegido</strong> hasta entrega confirmada</span>
              </div>
              <div className="book-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span><strong>Cancelación gratis</strong> hasta 24hs antes</span>
              </div>
              <div className="book-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                <span><strong>Comprobante PDF</strong> al finalizar</span>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* ═══ MODAL DE RESERVA ═══ */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">

            <div className="modal-head">
              <button type="button" className="modal-back" onClick={() => setCurStep(s => s - 1)} disabled={curStep === 1}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Volver
              </button>
              <button type="button" className="modal-close" onClick={closeModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="stepper">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className={`step${curStep === n ? ' active' : ''}${curStep > n ? ' done' : ''}`}>
                  <div className="step-circle">{curStep > n ? '✓' : n}</div>
                  <div className="step-label">{['Detalle', 'Cupos', 'Chat', 'Confirmar', 'Listo'][n - 1]}</div>
                </div>
              ))}
            </div>

            <div className="modal-body">

              {/* PASO 1 */}
              {curStep === 1 && (
                <>
                  <h2 className="pane-title">Confirmá los detalles</h2>
                  <p className="pane-sub">Revisá el viaje antes de continuar.</p>
                  <div className="summary-card">
                    <div className="summary-route">Córdoba <em>→</em> Buenos Aires</div>
                    <div className="summary-meta">
                      <span>📅 Sáb 26 abr</span>
                      <span>📏 700 km</span>
                      <span>🐴 Equinos</span>
                      <span>⏰ 07:00 hs</span>
                    </div>
                  </div>
                  <div className="summary-card" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div className="dual-av" style={{ margin: 0 }}>JR</div>
                    <div>
                      <div style={{ fontFamily: "var(--font-lora,'Lora',serif)", fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Jorge Ramírez ✓</div>
                      <div style={{ fontSize: '12px', color: 'var(--c5)' }}>★ 4.9 · 84 viajes · 0 cancelaciones</div>
                    </div>
                  </div>
                  <div className="note-card">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <div className="note-card-text"><strong>Cancelación gratuita</strong>Tenés hasta 24hs antes del viaje para cancelar y recuperar el 100% de la seña.</div>
                  </div>
                </>
              )}

              {/* PASO 2 */}
              {curStep === 2 && (
                <>
                  <h2 className="pane-title">¿Cuántos cupos necesitás?</h2>
                  <p className="pane-sub">Hay {MAX_CUPOS} cupos disponibles en este viaje.</p>
                  <div className="cupos-big">
                    <div className="cupos-big-label">Cupos a reservar</div>
                    <div className="cupos-big-row">
                      <button type="button" className="cupos-big-btn" onClick={() => setMCupos(c => Math.max(1, c - 1))}>−</button>
                      <span className="cupos-big-num">{mCupos}</span>
                      <button type="button" className="cupos-big-btn" onClick={() => setMCupos(c => Math.min(MAX_CUPOS, c + 1))}>+</button>
                    </div>
                    <div className="cupos-big-sub">Máximo {MAX_CUPOS} cupos disponibles</div>
                  </div>
                  <div className="totals-modal">
                    <div className="totals-row"><span>Cupos seleccionados</span><span className="totals-val">{mCupos} cupo{mCupos > 1 ? 's' : ''}</span></div>
                    <div className="totals-row"><span>Precio por cupo</span><span className="totals-val">{fmt(PRICE)}</span></div>
                    <div className="totals-row big"><span>Total del viaje</span><span className="totals-val">{fmt(mSub)}</span></div>
                    <div className="totals-row" style={{ color: 'var(--c4-dark)', fontWeight: 700 }}><span>Seña ahora (20%)</span><span className="totals-val">{fmt(mSenaAmt)}</span></div>
                    <div className="totals-row"><span>Saldo antes de salir</span><span className="totals-val" style={{ color: 'var(--c5)' }}>{fmt(mSaldo)}</span></div>
                  </div>
                </>
              )}

              {/* PASO 3 */}
              {curStep === 3 && (
                <>
                  <h2 className="pane-title">¿Cómo querés coordinar?</h2>
                  <p className="pane-sub">Después de pagar la seña podés contactar al transportista para coordinar detalles.</p>
                  <div className="chat-options">
                    <div className={`chat-opt${chatSelected === 'wsp' ? ' selected' : ''}`} onClick={() => setChatSelected('wsp')}>
                      <div className="chat-opt-icon wsp">💬</div>
                      <div className="chat-opt-name">WhatsApp</div>
                      <div className="chat-opt-desc">Coordiná con el número verificado de Jorge.</div>
                    </div>
                    <div className={`chat-opt${chatSelected === 'app' ? ' selected' : ''}`} onClick={() => setChatSelected('app')}>
                      <div className="chat-opt-icon app">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c4-dark)" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <div className="chat-opt-name">Chat de la app</div>
                      <div className="chat-opt-desc">Historial guardado y soporte en disputas.</div>
                    </div>
                  </div>
                  <div className="note-card">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                    <div className="note-card-text"><strong>¿Qué viene después?</strong>Tras coordinar, vos y Jorge confirman el viaje. Al confirmar ambos, se generan los comprobantes oficiales.</div>
                  </div>
                </>
              )}

              {/* PASO 4 */}
              {curStep === 4 && (
                <>
                  <h2 className="pane-title">Aceptación de ambas partes</h2>
                  <p className="pane-sub">Cuando los dos confirmen, se genera el comprobante oficial.</p>
                  <div className="dual-grid">
                    <div className="dual-card">
                      <div className="dual-av">MA</div>
                      <div className="dual-name">María Alfonzo</div>
                      <div className="dual-role">Cliente</div>
                      <button type="button" className={`dual-btn${confC ? ' confirmed' : ''}`} disabled={confC} onClick={() => handleConfirm('C')}>
                        {confC ? '✓ Confirmado' : '✓ Acepto'}
                      </button>
                    </div>
                    <div className="dual-card">
                      <div className="dual-av">JR</div>
                      <div className="dual-name">Jorge Ramírez</div>
                      <div className="dual-role">Transportista</div>
                      <button type="button" className={`dual-btn${confD ? ' confirmed' : ''}`} disabled={confD} onClick={() => handleConfirm('D')}>
                        {confD ? '✓ Confirmado' : '✓ Acepto'}
                      </button>
                    </div>
                  </div>
                  <div className="dual-pending">
                    {confC && confD ? '¡Ambas partes confirmaron! Generando comprobante...' : 'Ambas partes deben aceptar para finalizar.'}
                  </div>
                  <div className="note-card">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <div className="note-card-text"><strong>Generación de comprobante</strong>PDF con datos del viaje, partes, monto, condiciones y QR de seguimiento.</div>
                  </div>
                </>
              )}

              {/* PASO 5 */}
              {curStep === 5 && (
                <>
                  <div className="receipt-icon-wrap">
                    <div className="receipt-circle">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div className="receipt-title">¡Viaje confirmado!</div>
                    <div className="receipt-subtitle">Ambas partes aceptaron · Comprobante generado</div>
                    <div className="receipt-id">RD-2025-04-26-00847</div>
                  </div>
                  <div className="receipt-table">
                    <div className="receipt-row"><span className="receipt-label">Ruta</span><span className="receipt-val">Córdoba → Buenos Aires</span></div>
                    <div className="receipt-row"><span className="receipt-label">Fecha del viaje</span><span className="receipt-val">Sáb 26 de abril 2025</span></div>
                    <div className="receipt-row"><span className="receipt-label">Transportista</span><span className="receipt-val">Jorge Ramírez ★ 4.9</span></div>
                    <div className="receipt-row"><span className="receipt-label">Cupos reservados</span><span className="receipt-val green">{mCupos} cupo{mCupos > 1 ? 's' : ''}</span></div>
                    <div className="receipt-row"><span className="receipt-label">Total</span><span className="receipt-val green">{fmt(mSub)}</span></div>
                    <div className="receipt-row"><span className="receipt-label">Seña pagada</span><span className="receipt-val green">{fmt(mSenaAmt)} ✓</span></div>
                    <div className="receipt-row"><span className="receipt-label">Saldo pendiente</span><span className="receipt-val">{fmt(mSaldo)}</span></div>
                    <div className="receipt-row"><span className="receipt-label">Estado</span><span className="receipt-val green">CONFIRMADO ✓</span></div>
                  </div>
                </>
              )}

            </div>

            <div className="modal-foot">
              <button type="button" className="modal-btn-ghost" onClick={closeModal}>
                {curStep === 5 ? 'Cerrar' : 'Cancelar'}
              </button>
              {curStep !== 4 && (
                <button type="button" className="modal-btn-primary" onClick={nextStep}>
                  {stepLabel[curStep] ?? 'Continuar →'}
                </button>
              )}
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
          <div className="footer-legal"><a>Términos</a><a>Privacidad</a></div>
        </div>
      </footer>

    </div>
  );
}
