import { loginSchema } from "./login.schema";

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "client@example.com",
      password: "secret1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "secret1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects passwords shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "client@example.com",
      password: "12345",
    });

    expect(result.success).toBe(false);
  });
});
