import { clearAccessToken, getAccessToken, setAccessToken } from "./access-token-store";
import { getMe, logout, refreshSession } from "./auth-service";

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

describe("authService", () => {
  it("uses the in-memory access token when requesting auth/me", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    setAccessToken("access-token");

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      expect(String(input)).toBe("http://localhost:3001/auth/me");
      expect((init?.headers as Headers).get("Authorization")).toBe(
        "Bearer access-token",
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

    const user = await getMe();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(user.email).toBe("client@example.com");
  });

  it("stores the rotated access token returned by auth/refresh", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      expect(String(input)).toBe("http://localhost:3001/auth/refresh");
      expect(init?.method).toBe("POST");

      return createJsonResponse(
        {
          accessToken: "rotated-access-token",
        },
        { status: 200 },
      );
    });

    global.fetch = fetchMock;

    const response = await refreshSession();

    expect(response.accessToken).toBe("rotated-access-token");
    expect(getAccessToken()).toBe("rotated-access-token");
  });

  it("posts to /auth/logout with credentials included and clears the access token", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    setAccessToken("access-token");

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      expect(String(input)).toBe("http://localhost:3001/auth/logout");
      expect(init?.method).toBe("POST");
      expect(init?.credentials).toBe("include");

      return new Response(null, { status: 204 });
    });

    global.fetch = fetchMock;

    await logout();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
  });

  it("clears the access token even when /auth/logout fails", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    setAccessToken("stale-access-token");

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async () =>
      createJsonResponse(
        {
          statusCode: 500,
          message: "Internal Server Error",
        },
        { status: 500 },
      ));

    global.fetch = fetchMock;

    await expect(logout()).rejects.toMatchObject({
      message: "Internal Server Error",
      name: "ServerError",
      status: 500,
    });
    expect(getAccessToken()).toBeNull();
  });
});
