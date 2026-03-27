import type {
  ILoginResponse,
  IRegisterResponse,
  LoginDto,
  RegisterDto,
} from "@logistica/shared";

export type LoginFormValues = LoginDto;
export type LoginResponse = ILoginResponse;
export type RegisterFormValues = RegisterDto;
export type RegisterResponse = IRegisterResponse;
export type RegisterRole = RegisterFormValues["role"];

export type LoginErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "INVALID_RESPONSE";

export type RegisterErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_PAYLOAD"
  | "RATE_LIMITED"
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

export class RegisterRequestError extends Error {
  code: RegisterErrorCode;
  status?: number;

  constructor(code: RegisterErrorCode, message: string, status?: number) {
    super(message);
    this.name = "RegisterRequestError";
    this.code = code;
    this.status = status;
  }
}

export type LoginState = {
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
};

export type RegisterState = {
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
};
