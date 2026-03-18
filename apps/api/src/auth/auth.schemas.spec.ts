import {
  LoginSchema,
  RegisterClientSchema,
  RegisterTransporterSchema,
} from '@logistica/shared';

describe('auth schemas', () => {
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
