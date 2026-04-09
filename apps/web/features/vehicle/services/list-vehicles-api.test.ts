import { fetchOwnVehicles } from './list-vehicles-api';

jest.mock('@/features/auth/services/session/access-token-store', () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  '@/features/auth/services/session/access-token-store',
) as {
  getAccessToken: jest.Mock;
};

describe('fetchOwnVehicles', () => {
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

  it('returns the parsed vehicles list', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            brand: 'Scania',
            id: 'cmavhcl110000wqz5oy7k8v01',
            isActive: true,
            licensePlate: 'AA123BB',
            model: 'R450',
          },
        ]),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(fetchOwnVehicles()).resolves.toEqual([
      {
        brand: 'Scania',
        id: 'cmavhcl110000wqz5oy7k8v01',
        isActive: true,
        licensePlate: 'AA123BB',
        model: 'R450',
      },
    ]);

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/vehicles',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
        method: 'GET',
      }),
    );
    expect(headers.get('Authorization')).toBe('Bearer access-token-value');
  });

  it('throws when the vehicles payload is invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'not-a-cuid',
            licensePlate: 'AA123BB',
            brand: 'Scania',
            model: 'R450',
            isActive: true,
          },
        ]),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      ),
    ) as typeof fetch;

    await expect(fetchOwnVehicles()).rejects.toThrow(
      'payload invalido para GET /vehicles',
    );
  });
});
