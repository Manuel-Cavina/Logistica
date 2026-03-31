import { fetchTransporterProfile } from "./transporter-profile-api";

describe("fetchTransporterProfile", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
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
          id: "cm9abcdefghijklmnopqrst",
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
});
