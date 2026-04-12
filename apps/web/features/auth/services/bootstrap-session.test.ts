import { clearAccessToken, getAccessToken, setAccessToken } from "./access-token-store";
import { bootstrapSessionState } from "./bootstrap-session";

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

function createAccessToken(role: "CLIENT" | "TRANSPORTER" | "ADMIN"): string {
  const encodedPayload = Buffer.from(
    JSON.stringify({
      role,
      sub: "account-id",
    }),
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `header.${encodedPayload}.signature`;
}

function createJsonResponse(payload: unknown, init: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
}

afterEach(() => {
  global.fetch = originalFetch;
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  clearAccessToken();
  jest.restoreAllMocks();
});

describe("bootstrapSessionState", () => {
  it("restores the current session when auth/me succeeds immediately", async () => {
    setAccessToken("existing-access-token");

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (_input, init) => {
      expect((init?.headers as Headers).get("Authorization")).toBe(
        "Bearer existing-access-token",
      );

      return createJsonResponse(
        {
          id: "ckg1o2p3q0000b8jv1l8zmv6x",
          email: "client@example.com",
          role: "CLIENT",
        },
        { status: 200 },
      );
    });

    global.fetch = fetchMock;

    const session = await bootstrapSessionState();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(session).toEqual({
      accessToken: "existing-access-token",
      user: {
        id: "ckg1o2p3q0000b8jv1l8zmv6x",
        email: "client@example.com",
        role: "CLIENT",
      },
      status: "authenticated",
    });
  });

  it("refreshes the session and retries auth/me after a 401", async () => {
    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      const url = String(input);

      if (fetchMock.mock.calls.length === 1) {
        expect(url).toBe("/api/auth/me");
        expect((init?.headers as Headers).get("Authorization")).toBeNull();

        return createJsonResponse(
          {
            statusCode: 401,
            message: "Unauthorized",
          },
          { status: 401 },
        );
      }

      if (fetchMock.mock.calls.length === 2) {
        expect(url).toBe("/api/auth/refresh");

        return createJsonResponse(
          {
            accessToken: "rotated-access-token",
          },
          { status: 200 },
        );
      }

      expect(url).toBe("/api/auth/me");
      expect((init?.headers as Headers).get("Authorization")).toBe(
        "Bearer rotated-access-token",
      );

      return createJsonResponse(
        {
          id: "ckg1o2p3q0000b8jv1l8zmv6x",
          email: "client@example.com",
          role: "CLIENT",
        },
        { status: 200 },
      );
    });

    global.fetch = fetchMock;

    const session = await bootstrapSessionState();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessToken()).toBe("rotated-access-token");
    expect(session).toEqual({
      accessToken: "rotated-access-token",
      user: {
        id: "ckg1o2p3q0000b8jv1l8zmv6x",
        email: "client@example.com",
        role: "CLIENT",
      },
      status: "authenticated",
    });
  });

  it("rotates the access token when auth/me resolves a different effective role", async () => {
    setAccessToken(createAccessToken("CLIENT"));

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      const url = String(input);

      if (fetchMock.mock.calls.length === 1) {
        expect(url).toBe("/api/auth/me");
        expect((init?.headers as Headers).get("Authorization")).toContain(
          "Bearer header.",
        );

        return createJsonResponse(
          {
            id: "ckg1o2p3q0000b8jv1l8zmv6x",
            email: "transporter@example.com",
            role: "TRANSPORTER",
          },
          { status: 200 },
        );
      }

      if (fetchMock.mock.calls.length === 2) {
        expect(url).toBe("/api/auth/refresh");

        return createJsonResponse(
          {
            accessToken: "rotated-transporter-access-token",
          },
          { status: 200 },
        );
      }

      expect(url).toBe("/api/auth/me");
      expect((init?.headers as Headers).get("Authorization")).toBe(
        "Bearer rotated-transporter-access-token",
      );

      return createJsonResponse(
        {
          id: "ckg1o2p3q0000b8jv1l8zmv6x",
          email: "transporter@example.com",
          role: "TRANSPORTER",
        },
        { status: 200 },
      );
    });

    global.fetch = fetchMock;

    const session = await bootstrapSessionState();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessToken()).toBe("rotated-transporter-access-token");
    expect(session).toEqual({
      accessToken: "rotated-transporter-access-token",
      user: {
        id: "ckg1o2p3q0000b8jv1l8zmv6x",
        email: "transporter@example.com",
        role: "TRANSPORTER",
      },
      status: "authenticated",
    });
  });

  it("marks the session as unauthenticated when refresh fails", async () => {
    setAccessToken("stale-access-token");

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input) => {
      const url = String(input);

      if (fetchMock.mock.calls.length === 1) {
        expect(url).toBe("/api/auth/me");

        return createJsonResponse(
          {
            statusCode: 401,
            message: "Unauthorized",
          },
          { status: 401 },
        );
      }

      expect(url).toBe("/api/auth/refresh");

      return createJsonResponse(
        {
          statusCode: 401,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    });

    global.fetch = fetchMock;

    const session = await bootstrapSessionState();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBeNull();
    expect(session).toEqual({
      accessToken: null,
      user: null,
      status: "unauthenticated",
    });
  });
});
