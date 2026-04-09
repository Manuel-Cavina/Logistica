import { createTrailer } from './create-trailer-api';

jest.mock('@/features/auth/services/session/access-token-store', () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  '@/features/auth/services/session/access-token-store',
) as {
  getAccessToken: jest.Mock;
};

describe('createTrailer', () => {
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

  it('posts the trailer payload and returns the parsed response', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          capacityUnit: 'SLOT',
          cargoType: 'EQUINE',
          id: 'cmavhcl110000wqz5oy7k8v02',
          isActive: true,
          totalCapacity: 4,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 201,
        },
      ),
    ) as typeof fetch;

    await expect(
      createTrailer({
        capacityUnit: 'SLOT',
        cargoType: 'EQUINE',
        totalCapacity: 4,
      }),
    ).resolves.toMatchObject({
      id: 'cmavhcl110000wqz5oy7k8v02',
      totalCapacity: 4,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/trailers',
      expect.objectContaining({
        body: JSON.stringify({
          capacityUnit: 'SLOT',
          cargoType: 'EQUINE',
          totalCapacity: 4,
        }),
        credentials: 'include',
        headers: expect.any(Headers),
        method: 'POST',
      }),
    );

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(headers.get('Authorization')).toBe('Bearer access-token-value');
  });

  it('throws when the backend responds with an invalid trailer payload', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          created: true,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 201,
        },
      ),
    ) as typeof fetch;

    await expect(
      createTrailer({
        capacityUnit: 'SLOT',
        cargoType: 'EQUINE',
        totalCapacity: 4,
      }),
    ).rejects.toThrow('payload invalido');
  });
});
