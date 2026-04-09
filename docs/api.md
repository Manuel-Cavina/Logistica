# Contratos de la API

Estado documentado en este archivo:

- implementado hasta E1 Auth y E2 Transporter Onboarding
- sin document upload todavia
- sin `verificationNote` todavia

Base URL de desarrollo: `http://localhost:3001`

---

## Autenticacion

### `POST /auth/register`

Registro publico. Solo admite `CLIENT` y `TRANSPORTER`.

**Body CLIENT**

```json
{
  "role": "CLIENT",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string (opcional)"
}
```

**Body TRANSPORTER**

```json
{
  "role": "TRANSPORTER",
  "email": "string",
  "password": "string",
  "displayName": "string"
}
```

**Respuesta 201**

```json
{
  "account": {
    "id": "string",
    "email": "string",
    "role": "CLIENT | TRANSPORTER",
    "isEmailVerified": false
  }
}
```

**Errores**

- `400` registro invalido o no se pudo completar

---

### `POST /auth/login`

Inicia sesion y devuelve `accessToken` en el body. El `refreshToken` se devuelve
en cookie HttpOnly.

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
  "account": {
    "id": "string",
    "email": "string",
    "role": "CLIENT | TRANSPORTER | ADMIN",
    "isEmailVerified": true
  },
  "accessToken": "string"
}
```

**Cookie**

- `refresh_token` por defecto
- el nombre real puede cambiar via `AUTH_REFRESH_COOKIE_NAME`

**Errores**

- `401` credenciales invalidas

---

### `GET /auth/me`

Devuelve la cuenta autenticada. Requiere bearer token.

**Headers**

- `Authorization: Bearer <accessToken>`

**Respuesta 200**

```json
{
  "id": "string",
  "email": "string",
  "role": "CLIENT | TRANSPORTER | ADMIN"
}
```

**Errores**

- `401` token invalido o expirado

---

### `POST /auth/refresh`

Rota el refresh token y devuelve un nuevo access token.

**Respuesta 200**

```json
{
  "accessToken": "string"
}
```

**Errores**

- `401` refresh token invalido, expirado o revocado

---

### `POST /auth/logout`

Revoca la sesion actual y limpia la cookie de refresh.

**Respuesta 204**

Sin body.

---

## Perfil del transportista

Todos los endpoints de esta seccion requieren:

- bearer token valido
- rol `TRANSPORTER`

### `GET /transporter/profile`

Devuelve el perfil del transportista autenticado.

**Respuesta 200**

```json
{
  "displayName": "string",
  "businessName": "string | null",
  "contactPhone": "string | null",
  "bio": "string | null",
  "maxDetourKmDefault": "number | null",
  "verificationStatus": "INCOMPLETE | PENDING | VERIFIED | REJECTED"
}
```

**Errores**

- `401` no autenticado
- `403` rol incorrecto
- `404` no existe perfil asociado a la cuenta

---

### `PATCH /transporter/profile`

Actualiza el perfil del transportista autenticado.

Todos los campos son opcionales, pero el payload debe incluir al menos uno.

**Body**

```json
{
  "displayName": "string",
  "businessName": "string | null",
  "contactPhone": "string | null",
  "bio": "string | null",
  "maxDetourKmDefault": "number | null"
}
```

Regla actual:

- si el perfil esta en `INCOMPLETE`
- y despues del update tiene `displayName` y `contactPhone`
- entonces pasa automaticamente a `PENDING`

**Respuesta 200**

Mismo shape que `GET /transporter/profile`.

**Errores**

- `401` no autenticado
- `403` rol incorrecto
- `404` no existe perfil asociado a la cuenta

---

## Admin - transportistas

Todos los endpoints de esta seccion requieren:

- bearer token valido
- rol `ADMIN`

### `GET /admin/transporters`

Lista perfiles de transportistas.

**Query params**

- `status` (opcional): `INCOMPLETE | PENDING | VERIFIED | REJECTED`

**Respuesta 200**

```json
[
  {
    "id": "string",
    "displayName": "string",
    "contactPhone": "string | null",
    "verificationStatus": "INCOMPLETE | PENDING | VERIFIED | REJECTED"
  }
]
```

---

### `GET /admin/transporters/:id`

Devuelve el detalle de un perfil transportista.

**Path params**

- `id`: `cuid` del `TransporterProfile`

**Respuesta 200**

```json
{
  "id": "string",
  "displayName": "string",
  "businessName": "string | null",
  "contactPhone": "string | null",
  "bio": "string | null",
  "maxDetourKmDefault": "number | null",
  "verificationStatus": "INCOMPLETE | PENDING | VERIFIED | REJECTED"
}
```

**Errores**

- `404` perfil no encontrado

---

### `PATCH /admin/transporters/:id/verification-status`

Actualiza manualmente el estado de verificacion.

**Body**

```json
{
  "verificationStatus": "VERIFIED | REJECTED"
}
```

Reglas actuales:

- solo admite `VERIFIED` o `REJECTED`
- solo es valido si el perfil estaba en `PENDING`

**Respuesta 200**

Mismo shape que `GET /admin/transporters/:id`.

**Errores**

- `404` perfil no encontrado
- `409` transicion de estado invalida

---

## Flota E3

Todos los endpoints de esta seccion requieren:

- bearer token valido
- rol `TRANSPORTER`

### `GET /vehicles`

Lista los vehicles del transportista autenticado.

**Respuesta 200**

```json
[
  {
    "id": "string",
    "licensePlate": "string",
    "brand": "string",
    "model": "string",
    "isActive": true
  }
]
```

Reglas actuales:

- devuelve solo resources propios de la cuenta autenticada
- ordena activos primero

---

### `GET /trailers`

Lista los trailers del transportista autenticado.

**Respuesta 200**

```json
[
  {
    "id": "string",
    "totalCapacity": 12,
    "cargoType": "EQUINE | GENERAL_CARGO | FOOD | PEOPLE",
    "capacityUnit": "SLOT | KG | M3 | SEAT",
    "isActive": true
  }
]
```

Reglas actuales:

- devuelve solo resources propios de la cuenta autenticada
- ordena activos primero

### Contrato interno previsto para E4

`TrailerService.hasActiveTrailer(accountId: string): Promise<boolean>`

Uso esperado:

- validar si el transportista tiene al menos un trailer activo antes de publicar una `TripOffer`
- reutilizar el criterio desde futuros modulos sin duplicar queries ni materializar el listado completo

---

## Fuera de alcance por ahora

Todavia no existen en la API:

- endpoints de documentos de transportista
- `verificationNote`
- endpoints de `TripOffer`
