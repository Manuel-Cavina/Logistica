import { registerSchema } from "./register.schema";

describe("registerSchema", () => {
  it("accepts a valid CLIENT payload", () => {
    const result = registerSchema.safeParse({
      role: "CLIENT",
      email: "client@example.com",
      password: "supersafe123",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+5491112345678",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid TRANSPORTER payload", () => {
    const result = registerSchema.safeParse({
      role: "TRANSPORTER",
      email: "transporter@example.com",
      password: "supersafe123",
      displayName: "Acme Transportes",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a CLIENT payload without first and last name", () => {
    const result = registerSchema.safeParse({
      role: "CLIENT",
      email: "client@example.com",
      password: "supersafe123",
      firstName: "",
      lastName: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a TRANSPORTER payload without display name", () => {
    const result = registerSchema.safeParse({
      role: "TRANSPORTER",
      email: "transporter@example.com",
      password: "supersafe123",
      displayName: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email and a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      role: "CLIENT",
      email: "invalid-email",
      password: "1234567",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(result.success).toBe(false);
  });
});
