import { ApiError, buildApiError } from "./errors";
import type { ApiErrorBody, ApiResponse, HttpMethod, QueryParams, RequestOptions } from "./types";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const JSON_CONTENT_TYPE = "application/json";

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!baseUrl) {
    console.error(
      "NEXT_PUBLIC_API_URL is not configured. The API client will use relative paths until it is defined.",
    );
    return "";
  }

  return baseUrl.replace(/\/+$/, "");
}

function normalizePath(path: string): string {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string, params?: QueryParams): string {
  const baseUrl = getBaseUrl();
  const requestPath = normalizePath(path);
  const url = ABSOLUTE_URL_PATTERN.test(requestPath)
    ? requestPath
      : baseUrl
      ? `${baseUrl}${requestPath}`
      : requestPath;
  const urlObject = ABSOLUTE_URL_PATTERN.test(url)
    ? new URL(url)
    : new URL(url, "http://localhost");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      urlObject.searchParams.set(key, String(value));
    }
  }

  if (ABSOLUTE_URL_PATTERN.test(url)) {
    return urlObject.toString();
  }

  return `${urlObject.pathname}${urlObject.search}${urlObject.hash}`;
}

function buildHeaders(
  headers: HeadersInit | undefined,
  hasBody: boolean,
  rawBody: boolean | undefined,
): Headers {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", JSON_CONTENT_TYPE);
  }

  if (hasBody && !rawBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", JSON_CONTENT_TYPE);
  }

  return requestHeaders;
}

function buildBody(body: unknown, rawBody: boolean | undefined): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (rawBody) {
    return body as BodyInit;
  }

  return JSON.stringify(body);
}

async function parseErrorBody(response: Response): Promise<Partial<ApiErrorBody> | undefined> {
  try {
    return (await response.json()) as Partial<ApiErrorBody>;
  } catch {
    return {
      statusCode: response.status,
      message: response.statusText || `Request failed with status ${response.status}`,
    };
  }
}

async function parseResponseData<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
  method: HttpMethod = "GET",
): Promise<ApiResponse<T>> {
  const { body, params, rawBody, headers, ...rest } = options;
  const url = buildUrl(path, params);
  const hasBody = body !== undefined;

  try {
    const response = await fetch(url, {
      ...rest,
      method,
      headers: buildHeaders(headers, hasBody, rawBody),
      credentials: "include",
      body: buildBody(body, rawBody),
    });

    if (response.status === 204) {
      return {
        data: {} as T,
        status: response.status,
        ok: response.ok,
      };
    }

    if (!response.ok) {
      throw buildApiError(response.status, await parseErrorBody(response));
    }

    return {
      data: await parseResponseData<T>(response),
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(`Network error while requesting ${url}: ${error.message}`);
    }

    throw new Error(`Network error while requesting ${url}`);
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(path, options, "GET");
  },
  post<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(path, options, "POST");
  },
  put<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(path, options, "PUT");
  },
  patch<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(path, options, "PATCH");
  },
  delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(path, options, "DELETE");
  },
};
