import { clearAccessToken, getAccessToken, setAccessToken } from "./access-token-store";
import { bootstrapSessionState } from "./bootstrap-session";

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

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
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
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
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      const url = String(input);

      if (fetchMock.mock.calls.length === 1) {
        expect(url).toBe("http://localhost:3001/auth/me");
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
        expect(url).toBe("http://localhost:3001/auth/refresh");

        return createJsonResponse(
          {
            accessToken: "rotated-access-token",
          },
          { status: 200 },
        );
      }

      expect(url).toBe("http://localhost:3001/auth/me");
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

  it("marks the session as unauthenticated when refresh fails", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    setAccessToken("stale-access-token");

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input) => {
      const url = String(input);

      if (fetchMock.mock.calls.length === 1) {
        expect(url).toBe("http://localhost:3001/auth/me");

        return createJsonResponse(
          {
            statusCode: 401,
            message: "Unauthorized",
          },
          { status: 401 },
        );
      }

      expect(url).toBe("http://localhost:3001/auth/refresh");

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
