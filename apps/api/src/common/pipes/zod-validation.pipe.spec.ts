import { BadRequestException } from '@nestjs/common';
import { RegisterClientSchema } from '@logistica/shared';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  it('throws BadRequestException when the payload is invalid', () => {
    const pipe = new ZodValidationPipe(RegisterClientSchema);

    try {
      pipe.transform({
        email: 'invalid-email',
        password: 'short',
        firstName: '',
        lastName: 'Doe',
      });
      fail('Expected pipe to throw BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);

      const response = (error as BadRequestException).getResponse() as {
        fieldErrors: Record<string, string[] | undefined>;
      };

      expect(response.fieldErrors.email).toBeDefined();
      expect(response.fieldErrors.password).toBeDefined();
      expect(response.fieldErrors.firstName).toBeDefined();
    }
  });

  it('returns sanitized data when the payload is valid', () => {
    const pipe = new ZodValidationPipe(RegisterClientSchema);

    expect(
      pipe.transform({
        email: '  client@example.com  ',
        password: 'supersafe123',
        firstName: '  Jane ',
        lastName: ' Doe  ',
        phone: ' 12345 ',
      }),
    ).toEqual({
      email: 'client@example.com',
      password: 'supersafe123',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '12345',
    });
  });
});
