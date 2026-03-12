import { TRole } from "../../types/role.type";

export type TSignIn = {
  email: string;
  password: string;
};

export type TSignUp = {
  name: string;
  email: string;
  password: string;
  role?: TRole;
};

export type TChangePassword = {
  email: string;
  current_password: string;
  new_password: string;
};

export type TForgetPassword = {
  email: string;
};

export type TResetPassword = {
  email: string;
  password: string;
};

export type TJwtPayload = {
  id: number;
  name: string;
  email: string;
  role: TRole;
};
