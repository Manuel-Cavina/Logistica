export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParamValue = string | number | boolean | undefined | null;

export type QueryParams = Record<string, QueryParamValue>;

export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  body?: unknown;
  params?: QueryParams;
  rawBody?: boolean;
}

export type ApiResponse<T> = {
  data: T;
  status: number;
  ok: boolean;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
