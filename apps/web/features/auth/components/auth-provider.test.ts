import { executeLogout } from "../services/logout-flow";

describe("executeLogout", () => {
  it("closes the remote session and clears local auth state", async () => {
    const logoutRequest = jest.fn<Promise<void>, []>(async () => undefined);
    const applyUnauthenticatedState = jest.fn<void, []>(() => undefined);

    await expect(
      executeLogout(logoutRequest, applyUnauthenticatedState),
    ).resolves.toBeUndefined();

    expect(logoutRequest).toHaveBeenCalledTimes(1);
    expect(applyUnauthenticatedState).toHaveBeenCalledTimes(1);
  });

  it("keeps logout local-state cleanup idempotent when the backend request fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const logoutRequest = jest.fn<Promise<void>, []>(async () => {
      throw new Error("Network down");
    });
    const applyUnauthenticatedState = jest.fn<void, []>(() => undefined);

    await expect(
      executeLogout(logoutRequest, applyUnauthenticatedState),
    ).resolves.toBeUndefined();

    expect(applyUnauthenticatedState).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to close the remote session during logout.",
      expect.any(Error),
    );
  });
});
