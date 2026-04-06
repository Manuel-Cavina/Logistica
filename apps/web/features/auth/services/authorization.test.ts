import {
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  getDefaultAuthorizedPath,
  hasRequiredRole,
} from "./authorization";

describe("authorization helpers", () => {
  it("allows any authenticated role when no role restrictions are declared", () => {
    expect(hasRequiredRole("CLIENT")).toBe(true);
    expect(hasRequiredRole("TRANSPORTER", [])).toBe(true);
  });

  it("returns false when a restricted route has no user role", () => {
    expect(hasRequiredRole(null, ["ADMIN"])).toBe(false);
  });

  it("returns true only when the current role is included", () => {
    expect(hasRequiredRole("ADMIN", ["ADMIN"])).toBe(true);
    expect(hasRequiredRole("CLIENT", ["ADMIN", "TRANSPORTER"])).toBe(false);
  });

  it("returns a stable default path for each role", () => {
    expect(getDefaultAuthorizedPath("CLIENT")).toBe(
      DEFAULT_AUTHENTICATED_REDIRECT_PATH,
    );
    expect(getDefaultAuthorizedPath("TRANSPORTER")).toBe(
      DEFAULT_AUTHENTICATED_REDIRECT_PATH,
    );
    expect(getDefaultAuthorizedPath("ADMIN")).toBe("/admin/users");
  });

  it("falls back to the generic authenticated path when the role is missing", () => {
    expect(getDefaultAuthorizedPath(null)).toBe(
      DEFAULT_AUTHENTICATED_REDIRECT_PATH,
    );
  });
});
