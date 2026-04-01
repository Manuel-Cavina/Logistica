# Contratos de la API

Endpoints implementados al cierre de E1 (Auth) y E2 (Transporter Onboarding).
Base URL: `http://localhost:3001` en desarrollo.

---

## Autenticación

### `POST /auth/register`

Registra una nueva cuenta. Rol permitido: público.

**Body**
```json
{
  "email": "string",
  "password": "string",
  "role": "CLIENT" | "TRANSPORTER"
}
```

**Respuesta 201**
```json
{
  "accountId": "string",
  "email": "string",
  "role": "CLIENT" | "TRANSPORTER"
}
```

**Errores**
- `409` — email ya registrado

---

### `POST /auth/login`

Inicia sesión. Devuelve `accessToken` en el body y `refreshToken` en cookie
HttpOnly. Rol permitido: público.

**Body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta 200**
```json
{
  "accessToken": "string"
}
```

**Cookie** `refresh_token` — HttpOnly, SameSite=Lax

**Errores**
- `401` — credenciales inválidas

---

### `GET /auth/me`

Devuelve los datos de la cuenta autenticada. Requiere bearer token.

**Headers** `Authorization: Bearer <accessToken>`

**Respuesta 200**
```json
{
  "accountId": "string",
  "email": "string",
  "role": "CLIENT" | "TRANSPORTER" | "ADMIN"
}
```

**Errores**
- `401` — token inválido o expirado

---

### `POST /auth/refresh`

Renueva el access token usando el refresh token de la cookie. Rota el refresh
token. Rol permitido: público (requiere cookie válida).

**Cookie** `refresh_token` — enviada automáticamente por el browser

**Respuesta 200**
```json
{
  "accessToken": "string"
}
```

**Errores**
- `401` — refresh token inválido, expirado o ya rotado

---

### `POST /auth/logout`

Revoca la sesión activa. Limpia la cookie de refresh. Rol permitido: público
(requiere cookie válida).

**Respuesta 204** — sin body

---

## Perfil del transportista

### `GET /transporter/profile`

Devuelve el perfil del transportista autenticado. Requiere rol `TRANSPORTER`.

**Headers** `Authorization: Bearer <accessToken>`

**Respuesta 200**
```json
{
  "id": "string",
  "accountId": "string",
  "displayName": "string | null",
  "businessName": "string | null",
  "contactPhone": "string | null",
  "bio": "string | null",
  "maxDetourKmDefault": "number | null",
  "verificationStatus": "INCOMPLETE" | "PENDING" | "VERIFIED" | "REJECTED",
  "verificationNote": "string | null",
  "ratingAvg": "number | null",
  "ratingCount": "number"
}
```

**Errores**
- `401` — no autenticado
- `403` — rol incorrecto

---

### `PATCH /transporter/profile`

Actualiza el perfil del transportista autenticado. Todos los campos son
opcionales. Si el perfil queda completo, transiciona a `PENDING`
automáticamente. Requiere rol `TRANSPORTER`.

**Headers** `Authorization: Bearer <accessToken>`

**Body** (todos opcionales)
```json
{
  "displayName": "string",
  "businessName": "string",
  "contactPhone": "string",
  "bio": "string",
  "maxDetourKmDefault": "number"
}
```

**Respuesta 200** — mismo shape que `GET /transporter/profile`

**Errores**
- `401` — no autenticado
- `403` — rol incorrecto

---

## Admin — Transportistas

Todos los endpoints de admin requieren rol `ADMIN` y bearer token.

### `GET /admin/transporters`

Lista los perfiles de transportistas con filtro opcional por estado de
verificación.

**Query params**
- `verificationStatus` (opcional) — `INCOMPLETE | PENDING | VERIFIED | REJECTED`

**Respuesta 200**
```json
[
  {
    "id": "string",
    "accountId": "string",
    "email": "string",
    "displayName": "string | null",
    "businessName": "string | null",
    "contactPhone": "string | null",
    "verificationStatus": "string",
    "verificationNote": "string | null",
    "createdAt": "string (ISO 8601)"
  }
]
```

---

### `GET /admin/transporters/:id`

Devuelve el detalle completo de un perfil de transportista.

**Path params**
- `id` — UUID del `TransporterProfile`

**Respuesta 200**
```json
{
  "id": "string",
  "accountId": "string",
  "email": "string",
  "displayName": "string | null",
  "businessName": "string | null",
  "contactPhone": "string | null",
  "bio": "string | null",
  "maxDetourKmDefault": "number | null",
  "verificationStatus": "string",
  "verificationNote": "string | null",
  "ratingAvg": "number | null",
  "ratingCount": "number",
  "createdAt": "string (ISO 8601)"
}
```

**Errores**
- `404` — perfil no encontrado

---

### `PATCH /admin/transporters/:id/verification-status`

Cambia el estado de verificación de un transportista. Puede aprobar, rechazar
o marcar como pendiente.

**Path params**
- `id` — UUID del `TransporterProfile`

**Body**
```json
{
  "verificationStatus": "PENDING" | "VERIFIED" | "REJECTED",
  "verificationNote": "string (requerido si REJECTED)"
}
```

**Respuesta 200** — mismo shape que `GET /admin/transporters/:id`

**Errores**
- `404` — perfil no encontrado
- `422` — transición de estado inválida
