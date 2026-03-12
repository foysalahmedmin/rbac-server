import { Prisma } from '@prisma/client';
import { client } from '../../config/db';

import AppQuery from '../../builder/app-query';

export const findAll = async (query: Record<string, unknown> = {}) => {
  const appQuery = new AppQuery(query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .relations()
    .build();

  if (!appQuery.include) {
    appQuery.include = {
      _count: {
        select: { users: true },
      },
    };
  }

  const [data, total] = await Promise.all([
    client.role.findMany(appQuery as Prisma.RoleFindManyArgs),
    client.role.count({ where: appQuery.where as Prisma.RoleWhereInput }),
  ]);

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
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
