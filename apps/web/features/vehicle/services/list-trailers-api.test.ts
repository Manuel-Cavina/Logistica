import { fetchOwnTrailers } from './list-trailers-api';

jest.mock('@/features/auth/services/session/access-token-store', () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = jest.requireMock(
  '@/features/auth/services/session/access-token-store',
) as {
  getAccessToken: jest.Mock;
};

describe('fetchOwnTrailers', () => {
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

  it('returns the parsed trailers list', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            capacityUnit: 'SLOT',
            cargoType: 'EQUINE',
            id: 'cmavhcl110000wqz5oy7k8v02',
            isActive: true,
            totalCapacity: 12,
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

    await expect(fetchOwnTrailers()).resolves.toEqual([
      {
        capacityUnit: 'SLOT',
        cargoType: 'EQUINE',
        id: 'cmavhcl110000wqz5oy7k8v02',
        isActive: true,
        totalCapacity: 12,
      },
    ]);

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = requestInit.headers as Headers;

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/trailers',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
        method: 'GET',
      }),
    );
    expect(headers.get('Authorization')).toBe('Bearer access-token-value');
  });

  it('throws when the trailers payload is invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            capacityUnit: 'SLOT',
            cargoType: 'EQUINE',
            id: 'not-a-cuid',
            isActive: true,
            totalCapacity: 12,
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

    await expect(fetchOwnTrailers()).rejects.toThrow(
      'payload invalido para GET /trailers',
    );
  });
});
