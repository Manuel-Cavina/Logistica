import type { ApiErrorBody } from "./types";

function getErrorMessage(status: number, body?: Partial<ApiErrorBody>): string {
  if (Array.isArray(body?.message)) {
    return body.message.join(", ");
  }

  if (typeof body?.message === "string" && body.message.length > 0) {
    return body.message;
  }

  return `Request failed with status ${status}`;
}

export class ApiError extends Error {
  status: number;
  body?: Partial<ApiErrorBody>;

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(getErrorMessage(status, body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(body?: Partial<ApiErrorBody>) {
    super(400, body);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(body?: Partial<ApiErrorBody>) {
    super(401, body);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(body?: Partial<ApiErrorBody>) {
    super(403, body);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(body?: Partial<ApiErrorBody>) {
    super(404, body);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(body?: Partial<ApiErrorBody>) {
    super(409, body);
    this.name = "ConflictError";
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(body?: Partial<ApiErrorBody>) {
    super(422, body);
    this.name = "UnprocessableEntityError";
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(body?: Partial<ApiErrorBody>) {
    super(429, body);
    this.name = "TooManyRequestsError";
  }
}

export class ServerError extends ApiError {
  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(status, body);
    this.name = "ServerError";
  }
}

export function buildApiError(
  status: number,
  body?: Partial<ApiErrorBody>,
): ApiError {
  switch (status) {
    case 400:
      return new BadRequestError(body);
    case 401:
      return new UnauthorizedError(body);
    case 403:
      return new ForbiddenError(body);
    case 404:
      return new NotFoundError(body);
    case 409:
      return new ConflictError(body);
    case 422:
      return new UnprocessableEntityError(body);
    case 429:
      return new TooManyRequestsError(body);
    default:
      if (status >= 500) {
        return new ServerError(status, body);
      }

      return new ApiError(status, body);
  }
}
