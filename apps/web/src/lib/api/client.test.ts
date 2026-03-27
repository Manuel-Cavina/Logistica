import {
  apiClient,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "@/lib/api";

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
  jest.restoreAllMocks();
});

describe("apiClient", () => {
  it("returns data on GET 200 responses", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input) => {
      expect(String(input)).toBe("http://localhost:3001/auth/me");

      return createJsonResponse({ id: "user-1" }, { status: 200 });
    });

    global.fetch = fetchMock;

    const response = await apiClient.get<{ id: string }>("/auth/me");

    expect(response).toEqual({
      data: { id: "user-1" },
      status: 200,
      ok: true,
    });
  });

  it("sends POST bodies as JSON with the Content-Type header", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (_input, init) => {
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ email: "client@example.com" }));
      expect(init?.headers).toBeInstanceOf(Headers);
      expect((init?.headers as Headers).get("Content-Type")).toBe("application/json");
      expect((init?.headers as Headers).get("Accept")).toBe("application/json");

      return createJsonResponse({ created: true }, { status: 201 });
    });

    global.fetch = fetchMock;

    await apiClient.post<{ created: boolean }>("/auth/register", {
      body: { email: "client@example.com" },
    });
  });

  it("always includes credentials in every request", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (_input, init) => {
      expect(init?.credentials).toBe("include");

      return createJsonResponse({ ok: true }, { status: 200 });
    });

    global.fetch = fetchMock;

    await apiClient.get<{ ok: boolean }>("/health", {
      credentials: "omit",
    });
  });

  it("serializes query params and omits nullish values", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input) => {
      expect(String(input)).toBe(
        "http://localhost:3001/offers?page=2&published=true&origin=Buenos+Aires",
      );

      return createJsonResponse({ items: [] }, { status: 200 });
    });

    global.fetch = fetchMock;

    await apiClient.get<{ items: unknown[] }>("/offers", {
      params: {
        page: 2,
        published: true,
        origin: "Buenos Aires",
        destination: null,
        date: undefined,
      },
    });
  });

  it("returns an empty object for 204 responses", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async () => new Response(null, { status: 204 }));

    global.fetch = fetchMock;

    const response = await apiClient.delete<Record<string, never>>("/auth/session");

    expect(response).toEqual({
      data: {},
      status: 204,
      ok: true,
    });
  });

  it.each([
    [400, BadRequestError],
    [401, UnauthorizedError],
    [403, ForbiddenError],
    [404, NotFoundError],
    [409, ConflictError],
    [422, UnprocessableEntityError],
    [429, TooManyRequestsError],
    [500, ServerError],
  ])("maps HTTP %s to the correct error class", async (status, ErrorClass) => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async () =>
      createJsonResponse(
        {
          statusCode: status,
          message: `Status ${status}`,
          error: "Request failed",
        },
        { status },
      ),
    );

    global.fetch = fetchMock;

    await expect(apiClient.get("/auth/me")).rejects.toBeInstanceOf(ErrorClass);
  });

  it('wraps fetch rejections with a "Network error" message', async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async () => {
      throw new TypeError("Failed to fetch");
    });

    global.fetch = fetchMock;

    await expect(apiClient.get("/auth/me")).rejects.toThrow("Network error");
  });

  it("defaults to the Next proxy path when NEXT_PUBLIC_API_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input) => {
      expect(String(input)).toBe("/api/health");

      return createJsonResponse({ ok: true }, { status: 200 });
    });

    global.fetch = fetchMock;

    const response = await apiClient.get<{ ok: boolean }>("/health");

    expect(response.data.ok).toBe(true);
  });
});
