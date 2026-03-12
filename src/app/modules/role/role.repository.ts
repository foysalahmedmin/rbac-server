import { Prisma } from '@prisma/client';
import { client } from '../../config/db';

export const findAll = async () => {
  return await client.role.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
};

export const findById = async (id: number) => {
  return await client.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const findByName = async (name: string) => {
  return await client.role.findUnique({
    where: { name },
  });
};

export const create = async (data: Prisma.RoleCreateInput) => {
  return await client.role.create({
    data,
  });
};

export const update = async (id: number, data: Prisma.RoleUpdateInput) => {
  return await client.role.update({
    where: { id },
    data,
  });
};

export const remove = async (id: number) => {
  return await client.role.delete({
    where: { id },
  });
};

export const assignPermission = async (
  role_id: number,
  permission_id: number,
) => {
  return await client.rolePermission.create({
    data: {
      role_id,
      permission_id,
    },
  });
};

export const removePermission = async (
  role_id: number,
  permission_id: number,
) => {
  return await client.rolePermission.delete({
    where: {
      role_id_permission_id: {
        role_id,
        permission_id,
      },
    },
  });
};
