import { registerRequest } from "./use-register";

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

describe("registerRequest", () => {
  it("posts to /auth/register with credentials included", async () => {
    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async (input, init) => {
      expect(String(input)).toBe("/api/auth/register");
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
        },
        { status: 201 },
      );
    });

    const result = await registerRequest(
      {
        role: "CLIENT",
        email: "client@example.com",
        password: "supersafe123",
        firstName: "Jane",
        lastName: "Doe",
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.account.role).toBe("CLIENT");
  });

  it("maps 400 to a validation error", async () => {
    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async () => createJsonResponse({ message: "Bad Request" }, { status: 400 }));

    await expect(
      registerRequest(
        {
          role: "CLIENT",
          email: "client@example.com",
          password: "supersafe123",
          firstName: "Jane",
          lastName: "Doe",
        },
        fetchMock,
      ),
    ).rejects.toMatchObject({
      message: "No se pudo completar el registro con los datos ingresados.",
      name: "RegisterRequestError",
    });
  });

  it("rejects an invalid API payload", async () => {
    const fetchMock = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(async () => createJsonResponse({ ok: true }, { status: 201 }));

    await expect(
      registerRequest(
        {
          role: "TRANSPORTER",
          email: "transporter@example.com",
          password: "supersafe123",
          displayName: "Acme Transportes",
        },
        fetchMock,
      ),
    ).rejects.toMatchObject({
      message: "La API respondio con un formato invalido.",
      name: "RegisterRequestError",
    });
  });
});
