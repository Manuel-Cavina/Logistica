import { deactivateVehicle } from './deactivate-vehicle-api';

jest.mock('@/features/auth/services/session/access-token-store', () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  '@/features/auth/services/session/access-token-store',
) as {
  getAccessToken: jest.Mock;
};

describe('deactivateVehicle', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
    getAccessToken.mockReturnValue('access-token-value');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it('patches the deactivate endpoint and returns the parsed response', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          brand: 'Scania',
          id: 'cmavhcl110000wqz5oy7k8v01',
          isActive: false,
          licensePlate: 'AA123BB',
          model: 'R450',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(
      deactivateVehicle('cmavhcl110000wqz5oy7k8v01'),
    ).resolves.toMatchObject({
      id: 'cmavhcl110000wqz5oy7k8v01',
      isActive: false,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/vehicles/cmavhcl110000wqz5oy7k8v01/deactivate',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
        method: 'PATCH',
      }),
    );

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(headers.get('Authorization')).toBe('Bearer access-token-value');
  });

  it('throws when the backend responds with an invalid vehicle payload', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          deactivated: true,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(
      deactivateVehicle('cmavhcl110000wqz5oy7k8v01'),
    ).rejects.toThrow('payload invalido');
  });
});
