import type { ILoginResponse, LoginDto } from "@logistica/shared";

export type LoginFormValues = LoginDto;
export type LoginResponse = ILoginResponse;

export type LoginErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "INVALID_RESPONSE";

export class LoginRequestError extends Error {
  code: LoginErrorCode;
  status?: number;

  constructor(code: LoginErrorCode, message: string, status?: number) {
    super(message);
    this.name = "LoginRequestError";
    this.code = code;
    this.status = status;
  }
}

export type LoginState = {
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
};
