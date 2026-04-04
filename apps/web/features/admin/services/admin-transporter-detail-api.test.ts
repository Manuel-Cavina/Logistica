import { fetchAdminTransporterDetail } from "./admin-transporter-detail-api";

jest.mock("@/features/auth/services/session/access-token-store", () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  "@/features/auth/services/session/access-token-store",
) as {
  getAccessToken: jest.Mock;
};

describe("fetchAdminTransporterDetail", () => {
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

  it("returns the parsed admin transporter detail", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          bio: "Traslado de equinos con seguimiento en ruta.",
          businessName: "Transportes del Prado SRL",
          contactPhone: "1155550000",
          displayName: "Transportes del Prado",
          id: "cm9admintr0000wqz5oy7k8ph1",
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

    await expect(
      fetchAdminTransporterDetail("cm9admintr0000wqz5oy7k8ph1"),
    ).resolves.toEqual({
      bio: "Traslado de equinos con seguimiento en ruta.",
      businessName: "Transportes del Prado SRL",
      contactPhone: "1155550000",
      displayName: "Transportes del Prado",
      id: "cm9admintr0000wqz5oy7k8ph1",
      maxDetourKmDefault: 120,
      verificationStatus: "PENDING",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/transporters/cm9admintr0000wqz5oy7k8ph1",
      expect.objectContaining({
        credentials: "include",
        headers: expect.any(Headers),
        method: "GET",
      }),
    );
  });

  it("returns null when the transporter detail does not exist", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Transporter profile not found.",
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

    await expect(
      fetchAdminTransporterDetail("cm9admintr0000wqz5oy7k8ph1"),
    ).resolves.toBeNull();
  });

  it("throws when the admin transporter detail payload is invalid", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          bio: "Traslado de equinos con seguimiento en ruta.",
          businessName: "Transportes del Prado SRL",
          contactPhone: "1155550000",
          displayName: "Transportes del Prado",
          id: "not-a-cuid",
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

    await expect(
      fetchAdminTransporterDetail("cm9admintr0000wqz5oy7k8ph1"),
    ).rejects.toThrow(
      "La API respondio con un payload invalido para admin/transporters/:id.",
    );
  });
});
