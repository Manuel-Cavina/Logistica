'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: 'var(--c2)', fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", color: 'var(--ink)', fontSize: '14px', lineHeight: '1.5', WebkitFontSmoothing: 'antialiased' }}>

      {/* ═══ NAV ═══ */}
      <nav>
        <div className="nav-inner">
          <Link className="nav-logo" href="/">
            <div className="logo-mark">R</div>
            <div className="logo-word">Ruta<em> Directa</em></div>
          </Link>
          <div className="nav-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="¿Qué transporte equino necesitás?" />
            <button type="button" className="nav-search-btn">Buscar</button>
          </div>
          <div className="nav-actions">
            <Link className="nav-link" href="/como-funciona">Cómo funciona</Link>
            <Link className="nav-link" href="/login">Ingresá</Link>
            <Link className="nav-cta" href="/register">Registrate</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-banner">
          <div className="hero-content">
            <div className="hero-eyebrow"><span className="dot"></span>+1.200 viajes verificados</div>
            <h1>Encontrá tu<br />transporte equino<br /><em>de confianza.</em></h1>
            <p>Reservá cupos en viajes programados o contratá un transportista para tu propia ruta. Pago protegido y comprobante digital.</p>
            <div className="hero-actions">
              <button type="button" className="btn-arrow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button type="button" className="btn-pill-outline">Buscar viajes</button>
            </div>
          </div>
          <div className="hero-arrows-controls left">
            <button type="button" className="hero-arrow-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>
          <div className="hero-arrows-controls right">
            <button type="button" className="hero-arrow-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="hero-dots">
            <button type="button" className="hd-dot active"></button>
            <button type="button" className="hd-dot"></button>
            <button type="button" className="hd-dot"></button>
            <button type="button" className="hd-dot"></button>
          </div>
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <div className="trust-strip">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="trust-text"><strong>Verificación manual</strong><span>Cada transportista revisado</span></div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <div className="trust-text"><strong>Pago protegido</strong><span>Seña retenida hasta entrega</span></div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </div>
            <div className="trust-text"><strong>Comprobante digital</strong><span>PDF al finalizar</span></div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div className="trust-text"><strong>Cancelación gratis</strong><span>Hasta 24hs antes</span></div>
          </div>
        </div>
      </div>

      {/* ═══ CONTRATÁ UN TRANSPORTISTA ═══ */}
      <section className="section">
        <div className="section-head">
          <div className="section-title-wrap">
            <h2 className="section-title">Contratá un transportista</h2>
            <p className="section-sub">¿No encontrás un viaje programado que te sirva? Elegí un transportista verificado y propónele tu propio traslado con la fecha y ruta que necesites.</p>
          </div>
          <a className="section-link">Ver todos →</a>
        </div>

        <div className="tr-grid">

          <Link className="tr-card" href="/transportista/1">
            <div className="tr-photo" style={{backgroundImage:"linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.55)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80&auto=format&fit=crop')",backgroundSize:'cover',backgroundPosition:'center'}}>
              <span className="tr-verified-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6L9 17l-5-5"/></svg>
                Verificado
              </span>
              <button type="button" className="tr-fav-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="tr-avatar">JR</div>
            </div>
            <div className="tr-body">
              <div className="tr-name">Jorge Ramírez</div>
              <div className="tr-rating">
                <span className="star">★</span><strong>4.9</strong>(84 viajes)<span className="sep">·</span><span>10+ años</span>
              </div>
              <div className="tr-zone">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Base en <strong>Córdoba</strong>
              </div>
              <div className="tr-routes-label">Rutas que cubre</div>
              <div className="tr-routes">
                <span className="tr-route-pill">Córdoba ↔ Bs. As.</span>
                <span className="tr-route-pill">Córdoba ↔ Rosario</span>
                <span className="tr-route-pill">Norte AR</span>
              </div>
              <div className="tr-stats">
                <div className="tr-stat"><div className="tr-stat-n">3</div><div className="tr-stat-l">Cupos</div></div>
                <div className="tr-stat"><div className="tr-stat-n">0</div><div className="tr-stat-l">Cancela</div></div>
                <div className="tr-stat"><div className="tr-stat-n">24h</div><div className="tr-stat-l">Responde</div></div>
              </div>
              <span className="tr-btn">
                Proponer viaje
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </Link>

          <Link className="tr-card" href="/transportista/1">
            <div className="tr-photo alt-1" style={{backgroundImage:"linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.55)),url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80&auto=format&fit=crop')",backgroundSize:'cover',backgroundPosition:'center'}}>
              <span className="tr-verified-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6L9 17l-5-5"/></svg>
                Verificado
              </span>
              <button type="button" className="tr-fav-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="tr-avatar" style={{background:'#163A5F'}}>ML</div>
            </div>
            <div className="tr-body">
              <div className="tr-name">Marcelo López</div>
              <div className="tr-rating">
                <span className="star">★</span><strong>4.7</strong>(51 viajes)<span className="sep">·</span><span>7 años</span>
              </div>
              <div className="tr-zone">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Base en <strong>Mendoza</strong>
              </div>
              <div className="tr-routes-label">Rutas que cubre</div>
              <div className="tr-routes">
                <span className="tr-route-pill">Mendoza ↔ Rosario</span>
                <span className="tr-route-pill">Mendoza ↔ Bs. As.</span>
                <span className="tr-route-pill">Cuyo</span>
              </div>
              <div className="tr-stats">
                <div className="tr-stat"><div className="tr-stat-n">2</div><div className="tr-stat-l">Cupos</div></div>
                <div className="tr-stat"><div className="tr-stat-n">1</div><div className="tr-stat-l">Cancela</div></div>
                <div className="tr-stat"><div className="tr-stat-n">12h</div><div className="tr-stat-l">Responde</div></div>
              </div>
              <span className="tr-btn">
                Proponer viaje
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </Link>

          <Link className="tr-card" href="/transportista/1">
            <div className="tr-photo alt-2" style={{backgroundImage:"linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.55)),url('https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&q=80&auto=format&fit=crop')",backgroundSize:'cover',backgroundPosition:'center'}}>
              <span className="tr-verified-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6L9 17l-5-5"/></svg>
                Verificado
              </span>
              <button type="button" className="tr-fav-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="tr-avatar" style={{background:'#7A4A15'}}>CP</div>
            </div>
            <div className="tr-body">
              <div className="tr-name">Carlos Pedraza</div>
              <div className="tr-rating">
                <span className="star">★</span><strong>5.0</strong>(130 viajes)<span className="sep">·</span><span>15 años</span>
              </div>
              <div className="tr-zone">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Base en <strong>Tucumán</strong>
              </div>
              <div className="tr-routes-label">Rutas que cubre</div>
              <div className="tr-routes">
                <span className="tr-route-pill">NOA</span>
                <span className="tr-route-pill">Tucumán ↔ Córdoba</span>
                <span className="tr-route-pill">Salta ↔ Bs. As.</span>
              </div>
              <div className="tr-stats">
                <div className="tr-stat"><div className="tr-stat-n">4</div><div className="tr-stat-l">Cupos</div></div>
                <div className="tr-stat"><div className="tr-stat-n">0</div><div className="tr-stat-l">Cancela</div></div>
                <div className="tr-stat"><div className="tr-stat-n">6h</div><div className="tr-stat-l">Responde</div></div>
              </div>
              <span className="tr-btn">
                Proponer viaje
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </Link>

          <Link className="tr-card" href="/transportista/1">
            <div className="tr-photo alt-3" style={{backgroundImage:"linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.55)),url('https://images.unsplash.com/photo-1553284965-83fd3e82fa5b?w=600&q=80&auto=format&fit=crop')",backgroundSize:'cover',backgroundPosition:'center'}}>
              <span className="tr-verified-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6L9 17l-5-5"/></svg>
                Verificado
              </span>
              <button type="button" className="tr-fav-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="tr-avatar" style={{background:'#1A4A2A'}}>FP</div>
            </div>
            <div className="tr-body">
              <div className="tr-name">Fernando Pereyra</div>
              <div className="tr-rating">
                <span className="star">★</span><strong>4.6</strong>(43 viajes)<span className="sep">·</span><span>5 años</span>
              </div>
              <div className="tr-zone">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Base en <strong>Santa Fe</strong>
              </div>
              <div className="tr-routes-label">Rutas que cubre</div>
              <div className="tr-routes">
                <span className="tr-route-pill">Litoral</span>
                <span className="tr-route-pill">Santa Fe ↔ Mendoza</span>
                <span className="tr-route-pill">Bs. As. ↔ Córdoba</span>
              </div>
              <div className="tr-stats">
                <div className="tr-stat"><div className="tr-stat-n">3</div><div className="tr-stat-l">Cupos</div></div>
                <div className="tr-stat"><div className="tr-stat-n">2</div><div className="tr-stat-l">Cancela</div></div>
                <div className="tr-stat"><div className="tr-stat-n">8h</div><div className="tr-stat-l">Responde</div></div>
              </div>
              <span className="tr-btn">
                Proponer viaje
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* ═══ OFERTAS DE LA SEMANA ═══ */}
      <section className="section">
        <div className="section-head">
          <div className="section-title-wrap">
            <h2 className="section-title">Ofertas de la semana</h2>
          </div>
          <a className="section-link">Ver más →</a>
        </div>

        <div className="prod-grid">

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img">
              <span className="prod-img-tag">15% OFF</span>
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Córdoba</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Buenos Aires</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">3 cupos disponibles · Sáb 26 abr</div>
              <div className="prod-meta">700 km · Salida 07:00 hs</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Córdoba Capital
              </div>
              <div className="prod-driver">Jorge Ramírez · <strong>★ 4.9</strong></div>
              <div className="prod-price"><span className="prod-price-old">$100.000</span><span className="prod-price-off">15% OFF</span></div>
              <div className="prod-price">$ 85.000</div>
              <div className="prod-price-sub">Seña $17.000 · saldo antes de salir</div>
              <div className="prod-badges">
                <span className="prod-badge pb-yellow">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
                  12 cuotas sin interés
                </span>
                <span className="prod-badge pb-green">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5"/></svg>
                  Verificado
                </span>
              </div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-1">
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Mendoza</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Rosario</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">2 cupos disponibles · Lun 28 abr</div>
              <div className="prod-meta">1.100 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Mendoza Capital
              </div>
              <div className="prod-driver">Marcelo López · <strong>★ 4.7</strong></div>
              <div className="prod-price">$ 120.000</div>
              <div className="prod-price-sub">Seña $24.000 · cancelación gratis 48hs</div>
              <div className="prod-badges">
                <span className="prod-badge pb-blue">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Salida inmediata
                </span>
                <span className="prod-badge pb-green">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5"/></svg>
                  Verificado
                </span>
              </div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-2">
              <span className="prod-img-tag">25% OFF</span>
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Tucumán</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Córdoba</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">4 cupos disponibles · Vie 25 abr</div>
              <div className="prod-meta">680 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                San Miguel de Tucumán
              </div>
              <div className="prod-driver">Carlos Pedraza · <strong>★ 5.0</strong></div>
              <div className="prod-price"><span className="prod-price-old">$96.000</span><span className="prod-price-off">25% OFF</span></div>
              <div className="prod-price">$ 72.000</div>
              <div className="prod-price-sub">Seña $14.400</div>
              <div className="prod-badges">
                <span className="prod-badge pb-yellow">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
                  4 cuotas sin interés
                </span>
              </div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-3">
              <span className="prod-img-tag warn">⚡ Último cupo</span>
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Salta</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Bs. Aires</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">1 cupo disponible · Dom 27 abr</div>
              <div className="prod-meta">1.600 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Salta Capital
              </div>
              <div className="prod-driver">Roberto García · <strong>★ 4.8</strong></div>
              <div className="prod-price">$ 190.000</div>
              <div className="prod-price-sub">Seña $38.000 · saldo antes de salir</div>
              <div className="prod-badges">
                <span className="prod-badge pb-blue">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Salida inmediata
                </span>
              </div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-4">
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Córdoba</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Rosario</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">5 cupos disponibles · Jue 24 abr</div>
              <div className="prod-meta">390 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Córdoba Capital
              </div>
              <div className="prod-driver">Alejandro González · <strong>★ 4.9</strong></div>
              <div className="prod-price">$ 48.000</div>
              <div className="prod-price-sub">Seña $9.600 · cancelación gratis 48hs</div>
              <div className="prod-badges">
                <span className="prod-badge pb-yellow">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
                  6 cuotas sin interés
                </span>
                <span className="prod-badge pb-green">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5"/></svg>
                  Verificado
                </span>
              </div>
            </div>
          </Link>

        </div>

        <div className="ver-todas-wrap">
          <button type="button" className="ver-todas">Ver todas las ofertas</button>
        </div>
      </section>

      {/* ═══ CATEGORÍAS ═══ */}
      <section className="section">
        <div className="section-head">
          <div className="section-title-wrap">
            <h2 className="section-title">Encontrá viajes cerca de vos</h2>
          </div>
        </div>

        <div className="cat-grid">
          <a className="cat-item">
            <div className="cat-item-img">🐴</div>
            <div className="cat-item-name">Equinos</div>
          </a>
          <a className="cat-item">
            <div className="cat-item-img">🐄</div>
            <div className="cat-item-name">Ganado</div>
          </a>
          <a className="cat-item">
            <div className="cat-item-img">🐖</div>
            <div className="cat-item-name">Porcinos</div>
          </a>
          <a className="cat-item">
            <div className="cat-item-img">📦</div>
            <div className="cat-item-name">Mercadería</div>
          </a>
          <a className="cat-item">
            <div className="cat-item-img">🌾</div>
            <div className="cat-item-name">Agro general</div>
          </a>
          <a className="cat-item">
            <div className="cat-item-img">↩️</div>
            <div className="cat-item-name">Retornos</div>
          </a>
          <a className="cat-item">
            <div className="cat-item-img">🚛</div>
            <div className="cat-item-name">Camioneros</div>
          </a>
        </div>
      </section>

      {/* ═══ FEATURED BANNERS ═══ */}
      <section className="section">
        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-text">
              <div className="feat-eyebrow">Para clientes</div>
              <div className="feat-title">¿Tenés caballos para trasladar?</div>
              <div className="feat-sub">Encontrá transportistas verificados con cupos compartidos. Pagás menos, llegan seguros.</div>
              <a className="feat-link">
                Buscar viajes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
            <div className="feat-decor">🐴</div>
          </div>
          <div className="feat-card alt">
            <div className="feat-text">
              <div className="feat-eyebrow">Para camioneros</div>
              <div className="feat-title">¿Tenés cupos vacíos?</div>
              <div className="feat-sub">Publicá tu viaje y llená retornos. +480 transportistas activos cobrando con seña protegida.</div>
              <Link className="feat-link" href="/register">
                Publicar mi viaje
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="feat-decor">🚛</div>
          </div>
        </div>
      </section>

      {/* ═══ ÚLTIMOS PUBLICADOS ═══ */}
      <section className="section">
        <div className="section-head">
          <div className="section-title-wrap">
            <h2 className="section-title">Últimos publicados</h2>
          </div>
          <a className="section-link">Ver más →</a>
        </div>

        <div className="prod-grid">

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img">
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">La Plata</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Mar del Plata</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">3 cupos · Vie 2 may</div>
              <div className="prod-meta">405 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                La Plata
              </div>
              <div className="prod-driver">Sergio Méndez · <strong>★ 4.7</strong></div>
              <div className="prod-price">$ 55.000</div>
              <div className="prod-price-sub">Seña $11.000</div>
              <div className="prod-badges">
                <span className="prod-badge pb-green">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5"/></svg>
                  Nuevo
                </span>
              </div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-1">
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Neuquén</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Bahía Blanca</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">2 cupos · Sáb 3 may</div>
              <div className="prod-meta">560 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Neuquén Capital
              </div>
              <div className="prod-driver">Luciana Méndez · <strong>★ 4.8</strong></div>
              <div className="prod-price">$ 78.000</div>
              <div className="prod-price-sub">Seña $15.600</div>
              <div className="prod-badges">
                <span className="prod-badge pb-green">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5"/></svg>
                  Nuevo
                </span>
              </div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-2">
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Córdoba</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">San Juan</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">3 cupos · Lun 5 may</div>
              <div className="prod-meta">580 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Córdoba Capital
              </div>
              <div className="prod-driver">Diego Sosa · <strong>★ 4.5</strong></div>
              <div className="prod-price">$ 68.000</div>
              <div className="prod-price-sub">Seña $13.600</div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-3">
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Bs. Aires</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Posadas</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">2 cupos · Mié 7 may</div>
              <div className="prod-meta">1.080 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Buenos Aires
              </div>
              <div className="prod-driver">María Cordero · <strong>★ 4.9</strong></div>
              <div className="prod-price">$ 145.000</div>
              <div className="prod-price-sub">Seña $29.000</div>
            </div>
          </Link>

          <Link className="prod-card" href="/viaje/1">
            <div className="prod-img alt-4">
              <button type="button" className="prod-img-fav" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div className="prod-route-from">Mendoza</div>
              <div className="prod-route-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
              <div className="prod-route-to">Bariloche</div>
            </div>
            <div className="prod-body">
              <div className="prod-tag-row"><span className="prod-tag">Equinos</span></div>
              <div className="prod-name">4 cupos · Jue 1 may</div>
              <div className="prod-meta">1.180 km</div>
              <div className="prod-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Mendoza Capital
              </div>
              <div className="prod-driver">Pablo Iturri · <strong>★ 4.8</strong></div>
              <div className="prod-price">$ 132.000</div>
              <div className="prod-price-sub">Seña $26.400</div>
              <div className="prod-badges">
                <span className="prod-badge pb-green">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5"/></svg>
                  Verificado
                </span>
              </div>
            </div>
          </Link>

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
            <p className="footer-tag">El marketplace de transporte equino más confiable de Argentina. Conectamos carga con destinos reales.</p>
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
              <li><a>Buscar viajes</a></li>
              <li><a>Para camioneros</a></li>
              <li><Link href="/como-funciona">Cómo funciona</Link></li>
              <li><a>Verificación</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Ayuda</h5>
            <ul>
              <li><a>Preguntas frecuentes</a></li>
              <li><a>Soporte</a></li>
              <li><a>Reportar problema</a></li>
              <li><a>Contacto</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a>Términos</a></li>
              <li><a>Privacidad</a></li>
              <li><a>Cancelaciones</a></li>
              <li><a>Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Ruta Directa — Argentina</span>
          <div className="footer-legal">
            <a>Términos</a>
            <a>Privacidad</a>
            <a>Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
