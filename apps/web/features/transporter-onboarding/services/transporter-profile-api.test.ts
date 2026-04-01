import { fetchTransporterProfile } from "./transporter-profile-api";

jest.mock("@/features/auth/services/session/access-token-store", () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  "@/features/auth/services/session/access-token-store",
) as {
  getAccessToken: jest.Mock;
};

describe("fetchTransporterProfile", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    getAccessToken.mockReturnValue("access-token-value");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("returns the parsed transporter profile on success", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          bio: "Especialistas en equinos",
          businessName: "Transporte Norte SRL",
          contactPhone: "1155550000",
          displayName: "Transporte Norte",
          maxDetourKmDefault: 120,
          verificationStatus: "PENDING",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(fetchTransporterProfile()).resolves.toMatchObject({
      displayName: "Transporte Norte",
      verificationStatus: "PENDING",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/transporter/profile",
      expect.objectContaining({
        credentials: "include",
        headers: expect.any(Headers),
        method: "GET",
      }),
    );

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer access-token-value");
  });

  it("accepts the current backend payload without transporter id", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          bio: null,
          businessName: null,
          contactPhone: "1155550000",
          displayName: "Transporte Sur",
          maxDetourKmDefault: null,
          verificationStatus: "INCOMPLETE",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(fetchTransporterProfile()).resolves.toEqual({
      bio: null,
      businessName: null,
      contactPhone: "1155550000",
      displayName: "Transporte Sur",
      maxDetourKmDefault: null,
      verificationStatus: "INCOMPLETE",
    });
  });

  it("returns null when the backend profile does not exist yet", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Transporter profile not found for the authenticated account.",
          statusCode: 404,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 404,
          statusText: "Not Found",
        },
      ),
    ) as typeof fetch;

    await expect(fetchTransporterProfile()).resolves.toBeNull();
  });

  it("does not send authorization header when the access token is missing", async () => {
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

    await expect(fetchTransporterProfile()).rejects.toMatchObject({
      status: 401,
    });

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(headers.get("Authorization")).toBeNull();
  });
});
