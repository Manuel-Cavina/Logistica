# API reference
<!-- version: 2.0 | last updated: 2026-10-02 -->

This document is the current HTTP endpoint inventory for `apps/api`. It lists routes, ownership, roles, and important behavior. Detailed business explanations belong in `docs/architecture.md` or `docs/guia-arquitectura-y-repaso.md`.

> Source checked against NestJS controllers under `apps/api/src`.

---

## 1. Conventions

Routes below are shown without host.

Authentication uses:

- access token for protected API calls;
- refresh token cookie for refresh/logout flows;
- role guards for `CLIENT`, `TRANSPORTER`, and `ADMIN` boundaries.

Validation uses Zod schemas through `ZodValidationPipe`.

---

## 2. Endpoint summary

| Domain | Method | Route | Auth | Role |
|---|---:|---|---|---|
| Auth | `POST` | `/auth/register` | No | Public |
| Auth | `POST` | `/auth/login` | No | Public |
| Auth | `GET` | `/auth/me` | Yes | Any authenticated |
| Auth | `POST` | `/auth/refresh` | Cookie | Session owner |
| Auth | `POST` | `/auth/logout` | Cookie | Session owner |
| Transporter profile | `GET` | `/transporter/profile` | Yes | `TRANSPORTER` |
| Transporter profile | `PATCH` | `/transporter/profile` | Yes | `TRANSPORTER` |
| Admin transporters | `GET` | `/admin/transporters` | Yes | `ADMIN` |
| Admin transporters | `GET` | `/admin/transporters/:id` | Yes | `ADMIN` |
| Admin transporters | `PATCH` | `/admin/transporters/:id/verification-status` | Yes | `ADMIN` |
| Vehicles | `GET` | `/vehicles` | Yes | `TRANSPORTER` |
| Vehicles | `POST` | `/vehicles` | Yes | `TRANSPORTER` |
| Vehicles | `PATCH` | `/vehicles/:id` | Yes | `TRANSPORTER` |
| Vehicles | `PATCH` | `/vehicles/:id/deactivate` | Yes | `TRANSPORTER` |
| Trailers | `GET` | `/trailers` | Yes | `TRANSPORTER` |
| Trailers | `POST` | `/trailers` | Yes | `TRANSPORTER` |
| Trailers | `PATCH` | `/trailers/:id` | Yes | `TRANSPORTER` |
| Trailers | `PATCH` | `/trailers/:id/deactivate` | Yes | `TRANSPORTER` |
| Trip offers | `GET` | `/trip-offers/search` | No | Public |
| Trip offers | `GET` | `/trip-offers/:id/public` | No | Public |
| Trip offers | `GET` | `/trip-offers/my` | Yes | `TRANSPORTER` |
| Trip offers | `POST` | `/trip-offers` | Yes | `TRANSPORTER` |
| Trip offers | `PATCH` | `/trip-offers/:id` | Yes | `TRANSPORTER` |
| Trip offers | `POST` | `/trip-offers/:id/publish` | Yes | `TRANSPORTER` |
| Trip offers | `POST` | `/trip-offers/:id/close` | Yes | `TRANSPORTER` |
| Trip offers | `POST` | `/trip-offers/:id/cancel` | Yes | `TRANSPORTER` |
| Bookings | `POST` | `/bookings` | Yes | `CLIENT` |
| Bookings | `GET` | `/bookings/:id` | Yes | `CLIENT` |
| Bookings | `POST` | `/bookings/:id/cancel` | Yes | `CLIENT` |

---

## 3. Auth

### `POST /auth/register`

Creates an account and initial profile data.

- Public route.
- Validated with `RegisterSchema` from `@logistica/shared`.
- Rate-limited by `AuthRateLimitGuard` and auth throttle config.

### `POST /auth/login`

Authenticates an account.

- Public route.
- Validated with `LoginSchema`.
- Rate-limited.
- Sets the refresh cookie through the authentication cookie configuration.
- Returns the login response without exposing the refresh token in the JSON body.

### `GET /auth/me`

Returns current authenticated account data.

- Requires `JwtAuthGuard`.
- Uses account data from the JWT payload.

### `POST /auth/refresh`

Rotates/refreshes the session.

- Reads refresh token from configured cookie.
- Clears the refresh cookie when refresh is unauthorized.
- Returns a new access-token response and sets a new refresh cookie.

### `POST /auth/logout`

Revokes the current refresh session and clears the refresh cookie.

- Returns `204 No Content`.

---

## 4. Transporter profile

### `GET /transporter/profile`

Returns the authenticated transporter profile.

- Requires `JwtAuthGuard` and `RolesGuard`.
- Role: `TRANSPORTER`.

### `PATCH /transporter/profile`

Updates the authenticated transporter profile.

- Requires role `TRANSPORTER`.
- Validated with `UpdateTransporterProfileSchema` from `@logistica/shared`.
- Service owns verification-status transition rules.

---

## 5. Admin transporters

All admin transporter routes require `JwtAuthGuard`, `RolesGuard`, and role `ADMIN`.

### `GET /admin/transporters`

Lists transporter profiles for admin review.

Query is validated with `GetAdminTransportersQuerySchema`.

### `GET /admin/transporters/:id`

Returns one transporter detail for admin review.

Route params are validated with `GetAdminTransporterParamsSchema`.

### `PATCH /admin/transporters/:id/verification-status`

Updates transporter verification status.

Body is validated with `UpdateAdminTransporterVerificationStatusSchema`.

---

## 6. Vehicles

All vehicle routes require role `TRANSPORTER`.

### `GET /vehicles`

Lists the authenticated transporter's vehicles.

### `POST /vehicles`

Creates a vehicle for the authenticated transporter.

Body is validated with `CreateVehicleSchema` from `@logistica/shared`.

### `PATCH /vehicles/:id`

Updates one owned vehicle.

Params are validated with `VehicleParamsSchema`. Body is validated with `UpdateVehicleSchema`.

### `PATCH /vehicles/:id/deactivate`

Soft-deactivates one owned vehicle.

---

## 7. Trailers

All trailer routes require role `TRANSPORTER`.

### `GET /trailers`

Lists the authenticated transporter's trailers.

### `POST /trailers`

Creates a trailer for the authenticated transporter.

Body is validated with `CreateTrailerSchema` from `@logistica/shared`.

### `PATCH /trailers/:id`

Updates one owned trailer.

Params are validated with `TrailerParamsSchema`. Body is validated with `UpdateTrailerSchema`.

### `PATCH /trailers/:id/deactivate`

Soft-deactivates one owned trailer.

---

## 8. Trip offers

### `GET /trip-offers/search`

Public search for published trip offers.

Query is validated with `SearchTripOffersQuerySchema`.

Important behavior:

- public route;
- returns paginated search response;
- filters and sorting are owned by `TripOfferService`;
- should not expose private transporter/account data.

### `GET /trip-offers/:id/public`

Public detail for one trip offer.

Params are validated with `TripOfferParamsSchema`.

### `GET /trip-offers/my`

Lists offers owned by the authenticated transporter.

- Requires role `TRANSPORTER`.

### `POST /trip-offers`

Creates an offer for the authenticated transporter.

- Requires role `TRANSPORTER`.
- Body is validated with `CreateTripOfferSchema`.

### `PATCH /trip-offers/:id`

Updates an owned offer.

- Requires role `TRANSPORTER`.
- Params validated with `TripOfferParamsSchema`.
- Body validated with `UpdateTripOfferSchema`.

### `POST /trip-offers/:id/publish`

Publishes an owned draft offer.

- Requires role `TRANSPORTER`.
- Returns `200`.

### `POST /trip-offers/:id/close`

Closes an owned offer.

- Requires role `TRANSPORTER`.
- Returns `200`.

### `POST /trip-offers/:id/cancel`

Cancels an owned offer.

- Requires role `TRANSPORTER`.
- Returns `200`.

---

## 9. Bookings

All booking routes require role `CLIENT`.

### `POST /bookings`

Creates a booking for the authenticated client.

Body is validated with `CreateBookingSchema` from `@logistica/shared`.

Important behavior:

- booking creation must protect available capacity;
- price snapshots are stored at booking time;
- current initial status is `PENDING_PAYMENT`;
- payment continuation is pending until Mercado Pago/webhooks are implemented.

### `GET /bookings/:id`

Returns one booking owned by the authenticated client.

Params are validated with `BookingParamsSchema`.

### `POST /bookings/:id/cancel`

Cancels one owned booking when service rules allow it.

Params are validated with `BookingParamsSchema`.

---

## 10. Not implemented yet

These product areas do not currently have API controllers in `apps/api/src`:

- payments and Mercado Pago preferences;
- Mercado Pago webhooks;
- proof/evidence upload confirmation;
- reviews/reputation;
- disputes;
- contact/chat restriction endpoints;
- receipt/PDF generation;
- password recovery backend;
- real admin users endpoint.

When any of these are added, update this document in the same PR.
