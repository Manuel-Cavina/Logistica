let accessToken: string | null = null;

// El access token queda solo en memoria: se pierde al refrescar la página y se
// reconstruye con /auth/refresh usando la cookie httpOnly del backend.
export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(nextAccessToken: string | null): void {
  accessToken = nextAccessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}
