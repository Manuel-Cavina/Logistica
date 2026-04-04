import { fetchAdminUsersMock } from "./admin-users-mock-api";

describe("fetchAdminUsersMock", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("returns the mocked admin users list", async () => {
    const request = fetchAdminUsersMock();

    jest.advanceTimersByTime(250);

    await expect(request).resolves.toEqual([
      {
        email: "laura.funes@example.com",
        id: "cm9adminus0000wqz5oy7k8ph1",
        name: "Laura Funes",
        role: "CLIENT",
      },
      {
        email: "transporte.prado@example.com",
        id: "cm9adminus0001wqz5oy7k8ph2",
        name: "Transportes del Prado",
        role: "TRANSPORTER",
      },
      {
        email: "ops.admin@example.com",
        id: "cm9adminus0002wqz5oy7k8ph3",
        name: "Operaciones Admin",
        role: "ADMIN",
      },
    ]);
  });
});
