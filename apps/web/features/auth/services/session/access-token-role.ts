import type { AuthRole } from "../../types/auth.types";

type AccessTokenPayload = {
  role?: unknown;
};

function decodeBase64Url(value: string): string | null {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedValue = normalizedValue.padEnd(
    Math.ceil(normalizedValue.length / 4) * 4,
    "=",
  );

  try {
    if (typeof globalThis.atob === "function") {
      const decodedValue = globalThis.atob(paddedValue);

      return decodeURIComponent(
        Array.from(decodedValue)
          .map((character) =>
            `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
          )
          .join(""),
      );
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(paddedValue, "base64").toString("utf-8");
    }
  } catch {
    return null;
  }

  return null;
}

export function getAccessTokenRole(
  accessToken: string | null | undefined,
): AuthRole | null {
  if (!accessToken) {
    return null;
  }

  const [, payloadSegment] = accessToken.split(".");

  if (!payloadSegment) {
    return null;
  }

  const decodedPayload = decodeBase64Url(payloadSegment);

  if (!decodedPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(decodedPayload) as AccessTokenPayload;

    if (
      payload.role === "CLIENT" ||
      payload.role === "TRANSPORTER" ||
      payload.role === "ADMIN"
    ) {
      return payload.role;
    }
  } catch {
    return null;
  }

  return null;
}
