import type {
  RegisterFormValues,
  RegisterRole,
} from "../types/auth.types";

export type RegisterFormFields = {
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  role: RegisterRole;
};

export const defaultRegisterFormValues: RegisterFormFields = {
  role: "CLIENT",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  displayName: "",
};

export function toRegisterSubmissionValues(
  values: RegisterFormFields,
): RegisterFormValues {
  // El formulario captura campos distintos según rol, pero la API espera DTOs
  // específicos. Este mapper evita enviar datos de cliente al registro transportista.
  if (values.role === "TRANSPORTER") {
    return {
      role: "TRANSPORTER",
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    };
  }

  return {
    role: "CLIENT",
    email: values.email,
    password: values.password,
    firstName: values.firstName,
    lastName: values.lastName,
    ...(values.phone.trim() ? { phone: values.phone } : {}),
  };
}
