import { updateAdminTransporterStatus } from "./update-admin-transporter-status-api";

jest.mock("@/features/auth/services/session/access-token-store", () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  "@/features/auth/services/session/access-token-store",
) as {
  getAccessToken: jest.Mock;
};

describe("updateAdminTransporterStatus", () => {
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

  it("updates the transporter verification status and returns the updated detail", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          bio: "Traslado de equinos con seguimiento en ruta.",
          businessName: "Transportes del Prado SRL",
          contactPhone: "1155550000",
          displayName: "Transportes del Prado",
          id: "cm9admintr0000wqz5oy7k8ph1",
          maxDetourKmDefault: 120,
          verificationStatus: "VERIFIED",
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
      updateAdminTransporterStatus(
        "cm9admintr0000wqz5oy7k8ph1",
        "VERIFIED",
      ),
    ).resolves.toMatchObject({
      id: "cm9admintr0000wqz5oy7k8ph1",
      verificationStatus: "VERIFIED",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/transporters/cm9admintr0000wqz5oy7k8ph1/verification-status",
      expect.objectContaining({
        body: JSON.stringify({
          verificationStatus: "VERIFIED",
        }),
        credentials: "include",
        headers: expect.any(Headers),
        method: "PATCH",
      }),
    );
  });

  it("throws when the update payload is invalid", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "cm9admintr0000wqz5oy7k8ph1",
          verificationStatus: "VERIFIED",
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
      updateAdminTransporterStatus(
        "cm9admintr0000wqz5oy7k8ph1",
        "VERIFIED",
      ),
    ).rejects.toThrow(
      "La API respondio con un payload invalido para admin/transporters/:id/verification-status.",
    );
  });
});
