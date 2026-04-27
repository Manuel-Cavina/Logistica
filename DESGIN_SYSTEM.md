# Ruta Directa — Design System

Documento vivo. Es la fuente de verdad de cómo se ve y comporta el producto.

---

## 1. Paleta

Solo usar estas variables. No inventar colores nuevos.

```css
:root{
  --c1: #fffdf0;          /* cream — cards y elementos elevados */
  --c2: #ffffff;          /* fondo principal */
  --c3: #ac843e;          /* dorado — CTA principal */
  --c3-light: #bf9651;
  --c3-dark: #8a6929;
  --c4: #6c8473;          /* sage — color de marca */
  --c4-light: #86a08c;
  --c4-dark: #536659;
  --c4-soft: #eef2ee;     /* sage muy suave */
  --c5: #838891;          /* texto secundario */

  --ink: #2a2d33;         /* texto principal */
  --ink-soft: #4a4d54;
  --line: #e8e6dc;        /* divisores */
  --line-soft: #f0eee4;
}
```

**Reglas de uso:**
- Fondo de página: `--c2` (blanco) o `--c1` (cream para secciones alternadas)
- Cards: borde 1px `--line`, fondo `--c2`, hover con `--c4-light`
- CTA primario: fondo `--c3` (dorado) — solo para acciones principales
- Color de marca / acentos: `--c4` (sage)
- Texto secundario: `--c5`
- Pills de etiquetas sage: fondo `--c4-soft` con texto `--c4-dark`

## 2. Tipografía

```html
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Lora** (serif) — titulares, nombres, valores destacados, partes en italic
**DM Sans** (sans) — body, botones, labels, navegación

**Patrón de "Ruta Directa":** siempre `Ruta` en peso normal + `<em> Directa</em>` en italic con color sage.

## 3. Sombras y radio

```css
--shadow-xs: 0 1px 2px rgba(42,45,51,0.04);
--shadow-sm: 0 1px 3px rgba(42,45,51,0.06), 0 1px 2px rgba(42,45,51,0.04);
--shadow-md: 0 4px 16px rgba(42,45,51,0.08), 0 2px 4px rgba(42,45,51,0.04);
--shadow-lg: 0 12px 40px rgba(42,45,51,0.12), 0 4px 12px rgba(42,45,51,0.06);
--shadow-xl: 0 24px 60px rgba(42,45,51,0.16), 0 8px 20px rgba(42,45,51,0.08);

--r-sm: 8px;
--r-md: 12px;
--r-lg: 16px;
--r-xl: 24px;
--r-pill: 100px;
```

## 4. Componentes clave

### Logo
Cuadrado sage 38×38px con border-radius 9px. Letra "R" en Lora 18px peso 700 color blanco. Sombra sutil sage.

### Nav sticky
Altura ~70px, fondo blanco, borde inferior `--line`. Logo izquierda, buscador pill central (max 600px), acciones derecha (link + link + CTA dorado). Buscador con borde que se ilumina sage al focus + ring de 4px.

### Cards (genérico)
- Fondo `--c2`, borde 1px `--line`, radio 12-16px
- Hover: borde `--c4-light`, transform translateY(-3px), shadow `--shadow-lg`
- Transición: `all .25s`

### Cards de producto (viaje)
Imagen visual con gradiente sage o tierra (5 variantes: default, alt-1 a alt-5) que muestra ruta from→to en Lora blanco con flecha circular entre ambos. Tag dorado superior izq para descuentos, fav circular sup der. Body con tag categoría, nombre, meta, ubicación, transportista, precio Lora 18px y badges al final.

### Cards de transportista
Foto de fondo con overlay oscuro, badge "Verificado" sup izq, fav sup der, avatar circular 64px sage pisando la foto (bottom: -22px). Body con nombre, rating, zona, pills de rutas, mini stats (Cupos/Cancela/Responde) y CTA dorado "Proponer viaje".

### Botones
- **Primario dorado**: fondo `--c3`, texto blanco, padding 9-14px x 18-36px, radio 8-100px, sombra `0 4px 14px rgba(172,132,62,0.30)`. Hover: `--c3-dark`.
- **Secundario sage outline**: fondo blanco, borde 1.5px `--c4`, texto `--c4-dark`. Hover: fondo `--c4-soft`.
- **Pill ghost** (en hero oscuro): borde 2px rgba blanco 40%, hover 100%.
- **Arrow circular**: 54×54px blanco con flecha sage. Para CTAs hero.

### Hero banner
Card grande con border-radius 24px, fondo gradient sage→sage-dark, imagen recortada en clip-path diagonal a la derecha (60% width, polygon 20% 0). Overlay sage para legibilidad. Eyebrow con dot animado, h1 en Lora con `<em>` color crema, párrafo y dos CTAs (arrow blanco + pill outline). Flechas laterales para slider, dots inferiores con activo expandido a pill.

### Trust strip
Banda horizontal con 4 items: ícono circular sage soft (44px) + label en Lora `<strong>` + sub `<span>` color `--c5`.

### Footer oscuro
Fondo #1a1d22, padding 56px, grid 4 columnas (2fr 1fr 1fr 1fr). Brand izquierda con logo + tagline + redes en cuadrados 34px sage al hover. Cols con h5 uppercase letter-spacing 1.5px y ul de links color rgba blanco 0.55.

## 5. Patrones de página

### Estructura estándar
```
<nav> sticky
<section class="hero"> banner verde
<div class="trust-strip"> 4 garantías
<section class="section"> contenido principal
... más secciones alternando section / section-alt
<footer> oscuro
```

### Section
Container `max-width:1280px`, padding `64px 32px`. Title en Lora con highlight amarillo `#fef3c7` border-radius 6px (estilo marker). Section-link "Ver más →" en sage a la derecha.

### Grid breakpoints
- Default desktop: 5 cols ofertas, 4 cols transportistas, 7 cats, 4 trust
- 1100px: 3 cols ofertas, 2 cols transportistas, 4 cats
- 768px: 2 cols ofertas, 1 col transportistas, 3 cats, 2 trust
- 480px: 1 col

## 6. Microinteracciones

- **pulse**: dot animado verde lima `#bef264` con keyframes box-shadow
- **transform translateY(-3px)**: en hover de cards
- **transform translateX(4px)**: en hover de flechas dentro de botones
- **transition:all .25s**: estándar para cards
- **transition:all .15-.18s**: para botones y links

## 7. Páginas existentes y su rol

| Archivo | Propósito |
|---|---|
| `pagina_Agroads.html` | Home — hero, transportistas, ofertas, cats, banners, últimos |
| `publicacion_viaje.html` | Detalle de viaje programado + flujo de reserva con cupos (5 pasos) |
| `publicacion_transportista.html` | Perfil del transportista + flujo para proponer viaje (4 pasos) |
| `pagina_como_funciona.html` | Explicación del producto, flujos cliente/camionero, testimonios |
| `pagina_login.html` | Split layout con quote izquierda + form derecha |
| `pagina_register.html` | Split layout con beneficios + form con role selector |

## 8. Reglas de navegación

- El logo siempre lleva a `pagina_Agroads.html`
- Cards de "Contratá un transportista" → `publicacion_transportista.html`
- Cards de "Ofertas de la semana" y "Últimos publicados" → `publicacion_viaje.html`
- Nav cta "Registrate" → `pagina_register.html`
- Nav link "Ingresá" → `pagina_login.html`
- Footer/Nav "Cómo funciona" → `pagina_como_funciona.html`

## 9. Tono editorial

- En español rioplatense argentino (vos, tenés, querés)
- Frases cortas y directas
- Sin jerga técnica innecesaria
- Diferencial: "transporte equino verificado", "pago protegido", "comprobante digital"
- Evitar: "líder", "innovador", "revolucionario", buzzwords

## 10. Cómo extender el sistema

Si necesitás agregar un nuevo color o componente:

1. Primero verificá que no exista algo similar
2. Si es nuevo, agregá la variable a `:root`
3. Documentalo acá con un ejemplo de uso
4. Reusá las sombras y radios ya definidos

Si necesitás cambiar algo del sistema (ej. cambiar el dorado), editá este archivo primero. Los chats nuevos lo van a respetar.