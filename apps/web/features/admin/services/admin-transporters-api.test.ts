import { fetchAdminTransporters } from "./admin-transporters-api";

jest.mock("@/features/auth/services/session/access-token-store", () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  "@/features/auth/services/session/access-token-store",
) as {
  getAccessToken: jest.Mock;
};

describe("fetchAdminTransporters", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    getAccessToken.mockReturnValue("admin-access-token");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("returns the parsed admin transporters list", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            contactPhone: "1155550000",
            displayName: "Transportes del Prado",
            id: "cm9admintr0000wqz5oy7k8ph1",
            verificationStatus: "PENDING",
          },
        ]),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(fetchAdminTransporters()).resolves.toEqual([
      {
        contactPhone: "1155550000",
        displayName: "Transportes del Prado",
        id: "cm9admintr0000wqz5oy7k8ph1",
        verificationStatus: "PENDING",
      },
    ]);

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/transporters",
      expect.objectContaining({
        credentials: "include",
        headers: expect.any(Headers),
        method: "GET",
      }),
    );
    expect(headers.get("Authorization")).toBe("Bearer admin-access-token");
  });

  it("does not send the authorization header when the access token is missing", async () => {
    getAccessToken.mockReturnValue(null);
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Unauthorized",
          statusCode: 401,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 401,
          statusText: "Unauthorized",
        },
      ),
    ) as typeof fetch;

    await expect(fetchAdminTransporters()).rejects.toMatchObject({
      status: 401,
    });

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(headers.get("Authorization")).toBeNull();
  });

  it("throws when the admin transporters payload is invalid", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            displayName: "Transportes del Prado",
            id: "not-a-cuid",
            verificationStatus: "PENDING",
          },
        ]),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(fetchAdminTransporters()).rejects.toThrow(
      "La API respondio con un payload invalido para admin/transporters.",
    );
  });
});
