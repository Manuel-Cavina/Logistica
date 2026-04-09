import { deactivateTrailer } from './deactivate-trailer-api';

jest.mock('@/features/auth/services/session/access-token-store', () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  '@/features/auth/services/session/access-token-store',
) as {
  getAccessToken: jest.Mock;
};

describe('deactivateTrailer', () => {
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
          capacityUnit: 'SLOT',
          cargoType: 'EQUINE',
          id: 'cmavhcl110000wqz5oy7k8v02',
          isActive: false,
          totalCapacity: 6,
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
      deactivateTrailer('cmavhcl110000wqz5oy7k8v02'),
    ).resolves.toMatchObject({
      id: 'cmavhcl110000wqz5oy7k8v02',
      isActive: false,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/trailers/cmavhcl110000wqz5oy7k8v02/deactivate',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
        method: 'PATCH',
      }),
    );
  });

  it('throws when the backend responds with an invalid trailer payload', async () => {
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
      deactivateTrailer('cmavhcl110000wqz5oy7k8v02'),
    ).rejects.toThrow('payload invalido');
  });
});
