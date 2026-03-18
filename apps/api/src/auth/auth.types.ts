import type {
  IAuthAccount,
  ILoginDto,
  ITransporterProfileView,
  IUserProfileView,
} from '@logistica/shared';

interface RegisterBaseDto {
  email: string;
  password: string;
  role: 'CLIENT' | 'TRANSPORTER' | 'ADMIN';
}

export interface RegisterClientDto extends RegisterBaseDto {
  role: 'CLIENT';
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterTransporterDto extends RegisterBaseDto {
  role: 'TRANSPORTER';
  displayName: string;
  businessName?: string;
  contactPhone?: string;
  bio?: string;
}

export interface RegisterAdminDto extends RegisterBaseDto {
  role: 'ADMIN';
}

export type RegisterDto =
  | RegisterClientDto
  | RegisterTransporterDto
  | RegisterAdminDto;

export type LoginDto = ILoginDto;

export interface AuthUserView {
  account: IAuthAccount;
  profile: IUserProfileView | ITransporterProfileView | null;
}
