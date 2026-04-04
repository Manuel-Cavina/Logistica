import {
  resolveTransporterRouteAccess,
  TRANSPORTER_ONBOARDING_PATH,
} from "./transporter-route-access";

describe("resolveTransporterRouteAccess", () => {
  it.each(["idle", "loading"] as const)(
    "shows the fallback while the transporter profile is %s",
    (requestStatus) => {
      expect(
        resolveTransporterRouteAccess({
          pathname: "/dashboard",
          requestStatus,
          verificationStatus: null,
        }),
      ).toEqual({ action: "fallback" });
    },
  );

  it("shows the error state when the transporter profile could not be loaded", () => {
    expect(
      resolveTransporterRouteAccess({
        pathname: "/dashboard",
        requestStatus: "error",
        verificationStatus: null,
      }),
    ).toEqual({ action: "error" });
  });

  it("redirects incomplete transporters to onboarding", () => {
    expect(
      resolveTransporterRouteAccess({
        pathname: "/dashboard",
        requestStatus: "success",
        verificationStatus: "INCOMPLETE",
      }),
    ).toEqual({
      action: "redirect",
      redirectTo: TRANSPORTER_ONBOARDING_PATH,
    });
  });

  it("treats missing transporter profiles as incomplete", () => {
    expect(
      resolveTransporterRouteAccess({
        pathname: "/dashboard",
        requestStatus: "success",
        verificationStatus: null,
      }),
    ).toEqual({
      action: "redirect",
      redirectTo: TRANSPORTER_ONBOARDING_PATH,
    });
  });

  it("redirects rejected transporters to onboarding", () => {
    expect(
      resolveTransporterRouteAccess({
        pathname: "/dashboard",
        requestStatus: "success",
        verificationStatus: "REJECTED",
      }),
    ).toEqual({
      action: "redirect",
      redirectTo: TRANSPORTER_ONBOARDING_PATH,
    });
  });

  it("allows incomplete transporters to stay inside onboarding", () => {
    expect(
      resolveTransporterRouteAccess({
        pathname: TRANSPORTER_ONBOARDING_PATH,
        requestStatus: "success",
        verificationStatus: "INCOMPLETE",
      }),
    ).toEqual({ action: "render" });
  });

  it("allows pending transporters to navigate protected routes", () => {
    expect(
      resolveTransporterRouteAccess({
        pathname: "/dashboard",
        requestStatus: "success",
        verificationStatus: "PENDING",
      }),
    ).toEqual({ action: "render" });
  });

  it("allows verified transporters to navigate protected routes", () => {
    expect(
      resolveTransporterRouteAccess({
        pathname: "/dashboard",
        requestStatus: "success",
        verificationStatus: "VERIFIED",
      }),
    ).toEqual({ action: "render" });
  });
});
