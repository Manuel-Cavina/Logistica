import type {
  IAuthAccount,
  ILoginResponse,
  IMeResponse,
  IRefreshResponse,
  IRegisterResponse,
  LoginDto,
  RegisterDto,
} from "@logistica/shared";

export type LoginFormValues = LoginDto;
export type LoginResponse = ILoginResponse;
export type RefreshResponse = IRefreshResponse;
export type RegisterFormValues = RegisterDto;
export type RegisterResponse = IRegisterResponse;
export type RegisterRole = RegisterFormValues["role"];
export type AuthUser = IMeResponse;
export type AuthRole = AuthUser["role"];
export type AllowedRoles = readonly AuthRole[];
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthenticatedSession = {
  accessToken: string;
  user: AuthUser;
};

export type AuthSessionSnapshot = {
  accessToken: string | null;
  user: AuthUser | null;
  status: Exclude<AuthStatus, "loading">;
};

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isBootstrapped: boolean;
  bootstrapSession: () => Promise<void>;
  setAuthenticatedSession: (session: AuthenticatedSession) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
};

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

export type AuthAccountLike = Pick<IAuthAccount, "id" | "email" | "role">;
