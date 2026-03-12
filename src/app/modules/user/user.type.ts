import { TRole } from "../../types/role.type";

export type TUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: TRole;
  status: "active" | "blocked";
  is_deleted: boolean;
  deleted_at?: Date;
  updated_at?: Date;
  created_at?: Date;
};
