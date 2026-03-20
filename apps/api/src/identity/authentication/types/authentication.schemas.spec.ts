import {
  LoginSchema,
  RegisterSchema,
  RegisterClientSchema,
  RegisterTransporterSchema,
} from '@logistica/shared';

describe('auth schemas', () => {
  it('RegisterSchema accepts a CLIENT payload', () => {
    const result = RegisterSchema.safeParse({
      role: 'CLIENT',
      email: 'client@example.com',
      password: 'supersafe123',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+5491112345678',
    });

    expect(result.success).toBe(true);
  });

  it('RegisterSchema accepts a TRANSPORTER payload', () => {
    const result = RegisterSchema.safeParse({
      role: 'TRANSPORTER',
      email: 'transporter@example.com',
      password: 'supersafe123',
      displayName: 'Acme Transportes',
    });

    expect(result.success).toBe(true);
  });

  it('RegisterSchema rejects ADMIN role', () => {
    const result = RegisterSchema.safeParse({
      role: 'ADMIN',
      email: 'admin@example.com',
      password: 'supersafe123',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    expect(result.success).toBe(false);
  });

  it('RegisterSchema rejects a CLIENT payload without required profile fields', () => {
    const result = RegisterSchema.safeParse({
      role: 'CLIENT',
      email: 'client@example.com',
      password: 'supersafe123',
    });

    expect(result.success).toBe(false);
  });

  it('RegisterClientSchema rejects invalid email', () => {
    const result = RegisterClientSchema.safeParse({
      email: 'invalid-email',
      password: 'supersafe123',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    expect(result.success).toBe(false);
  });

  it('RegisterClientSchema rejects passwords shorter than 8 characters', () => {
    const result = RegisterClientSchema.safeParse({
      email: 'client@example.com',
      password: 'short',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    expect(result.success).toBe(false);
  });

  it('RegisterTransporterSchema rejects empty displayName', () => {
    const result = RegisterTransporterSchema.safeParse({
      email: 'transporter@example.com',
      password: 'supersafe123',
      displayName: '   ',
    });

    expect(result.success).toBe(false);
  });

  it('RegisterTransporterSchema strips advanced transporter fields from the base flow', () => {
    const result = RegisterTransporterSchema.safeParse({
      email: 'transporter@example.com',
      password: 'supersafe123',
      displayName: 'Acme Transportes',
      businessName: 'Acme SRL',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        email: 'transporter@example.com',
        password: 'supersafe123',
        displayName: 'Acme Transportes',
      });
    }
  });

  it('LoginSchema rejects invalid email', () => {
    const result = LoginSchema.safeParse({
      email: 'invalid-email',
      password: 'supersafe123',
    });

    expect(result.success).toBe(false);
  });

  it('LoginSchema rejects empty password', () => {
    const result = LoginSchema.safeParse({
      email: 'client@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});
