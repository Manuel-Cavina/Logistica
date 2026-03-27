import { runLogoutFlow } from "./use-logout";

describe("runLogoutFlow", () => {
  it("redirects to the public home after clearing the session", async () => {
    const replace = jest.fn<void, [string]>(() => undefined);
    const logout = jest.fn<Promise<void>, []>(async () => undefined);
    const setState = jest.fn<void, [{ error: string | null; isLoading: boolean }]>(
      () => undefined,
    );

    await runLogoutFlow({
      logout,
      replace,
      setState,
    });

    expect(logout).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenNthCalledWith(1, {
      error: null,
      isLoading: true,
    });
    expect(setState).toHaveBeenNthCalledWith(2, {
      error: null,
      isLoading: false,
    });
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("keeps the user on the current screen when the local logout flow throws", async () => {
    const replace = jest.fn<void, [string]>(() => undefined);
    const logout = jest.fn<Promise<void>, []>(async () => {
      throw new Error("Unexpected logout failure");
    });
    const setState = jest.fn<void, [{ error: string | null; isLoading: boolean }]>(
      () => undefined,
    );

    await runLogoutFlow({
      logout,
      replace,
      setState,
    });

    expect(replace).not.toHaveBeenCalled();
    expect(setState).toHaveBeenNthCalledWith(2, {
      error: "Unexpected logout failure",
      isLoading: false,
    });
  });
});
