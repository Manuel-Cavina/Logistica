import {
  AUTHENTICATED_REDIRECT_PATH,
  resolveAuthRouteAccess,
  UNAUTHENTICATED_REDIRECT_PATH,
} from "./auth-route-access";

describe("resolveAuthRouteAccess", () => {
  it("shows the fallback while the session bootstrap is still pending", () => {
    expect(
      resolveAuthRouteAccess({
        isBootstrapped: false,
        mode: "protected",
        status: "loading",
      }),
    ).toEqual({ action: "fallback" });
  });

  it("redirects unauthenticated users away from protected routes", () => {
    expect(
      resolveAuthRouteAccess({
        isBootstrapped: true,
        mode: "protected",
        status: "unauthenticated",
      }),
    ).toEqual({
      action: "redirect",
      redirectTo: UNAUTHENTICATED_REDIRECT_PATH,
    });
  });

  it("renders protected routes for authenticated users", () => {
    expect(
      resolveAuthRouteAccess({
        isBootstrapped: true,
        mode: "protected",
        status: "authenticated",
        userRole: "CLIENT",
      }),
    ).toEqual({ action: "render" });
  });

  it("renders protected routes without role restrictions for any authenticated user", () => {
    expect(
      resolveAuthRouteAccess({
        isBootstrapped: true,
        mode: "protected",
        status: "authenticated",
        userRole: "TRANSPORTER",
      }),
    ).toEqual({ action: "render" });
  });

  it("renders protected routes when the user role is allowed", () => {
    expect(
      resolveAuthRouteAccess({
        allowedRoles: ["ADMIN"],
        isBootstrapped: true,
        mode: "protected",
        status: "authenticated",
        userRole: "ADMIN",
      }),
    ).toEqual({ action: "render" });
  });

  it("renders an unauthorized state when the user role is not allowed", () => {
    expect(
      resolveAuthRouteAccess({
        allowedRoles: ["ADMIN"],
        isBootstrapped: true,
        mode: "protected",
        status: "authenticated",
        userRole: "CLIENT",
      }),
    ).toEqual({ action: "unauthorized" });
  });

  it("redirects authenticated users away from guest-only routes", () => {
    expect(
      resolveAuthRouteAccess({
        isBootstrapped: true,
        mode: "guest-only",
        status: "authenticated",
        userRole: "CLIENT",
      }),
    ).toEqual({
      action: "redirect",
      redirectTo: AUTHENTICATED_REDIRECT_PATH,
    });
  });

  it("renders guest-only routes for unauthenticated users", () => {
    expect(
      resolveAuthRouteAccess({
        isBootstrapped: true,
        mode: "guest-only",
        status: "unauthenticated",
      }),
    ).toEqual({ action: "render" });
  });
});
