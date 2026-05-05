import { loginRequest } from "./use-login";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

function createJsonResponse(payload: unknown, init: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
}

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  jest.restoreAllMocks();
});

describe("loginRequest", () => {
  it("posts to /auth/login with credentials included", async () => {
    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      expect(String(input)).toBe("/api/auth/login");
      expect(init?.method).toBe("POST");
      expect(init?.credentials).toBe("include");
      expect(
        init?.headers && (init.headers as Record<string, string>)["Content-Type"],
      ).toBe("application/json");

      return createJsonResponse(
        {
          account: {
            id: "ckg1o2p3q0000b8jv1l8zmv6x",
            email: "client@example.com",
            role: "CLIENT",
            isEmailVerified: false,
          },
          accessToken: "access-token",
        },
        { status: 200 },
      );
    });

    const result = await loginRequest(
      {
        email: "client@example.com",
        password: "secret1",
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBe("access-token");
  });

  it("maps 401 to invalid credentials", async () => {
    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async () => createJsonResponse({ message: "Unauthorized" }, { status: 401 }));

    await expect(
      loginRequest(
        {
          email: "client@example.com",
          password: "secret1",
        },
        fetchMock,
      ),
    ).rejects.toMatchObject({
      message: "Credenciales invalidas",
      name: "LoginRequestError",
    });
  });
});
