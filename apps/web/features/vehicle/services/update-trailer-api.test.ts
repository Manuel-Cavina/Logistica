import { updateTrailer } from './update-trailer-api';

jest.mock('@/features/auth/services/session/access-token-store', () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  '@/features/auth/services/session/access-token-store',
) as {
  getAccessToken: jest.Mock;
};

describe('updateTrailer', () => {
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

  it('patches the trailer payload and returns the parsed response', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          capacityUnit: 'M3',
          cargoType: 'GENERAL_CARGO',
          id: 'cmavhcl110000wqz5oy7k8v02',
          isActive: true,
          totalCapacity: 8,
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
      updateTrailer('cmavhcl110000wqz5oy7k8v02', {
        capacityUnit: 'M3',
        cargoType: 'GENERAL_CARGO',
        totalCapacity: 8,
      }),
    ).resolves.toMatchObject({
      capacityUnit: 'M3',
      cargoType: 'GENERAL_CARGO',
      id: 'cmavhcl110000wqz5oy7k8v02',
      totalCapacity: 8,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/trailers/cmavhcl110000wqz5oy7k8v02',
      expect.objectContaining({
        body: JSON.stringify({
          capacityUnit: 'M3',
          cargoType: 'GENERAL_CARGO',
          totalCapacity: 8,
        }),
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
          updated: true,
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
      updateTrailer('cmavhcl110000wqz5oy7k8v02', {
        totalCapacity: 8,
      }),
    ).rejects.toThrow('payload invalido');
  });
});
