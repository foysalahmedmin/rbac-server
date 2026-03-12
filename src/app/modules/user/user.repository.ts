import { Prisma } from '@prisma/client';
import { client } from '../../config/db';

import AppQuery from '../../builder/app-query';

export const findAll = async (query: Record<string, unknown>) => {
  const appQuery = new AppQuery(query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .relations()
    .build();

  appQuery.where = {
    ...((appQuery.where as Record<string, unknown>) || {}),
    is_deleted: false,
  };

  if (!appQuery.select && !appQuery.include) {
    appQuery.select = {
      id: true,
      name: true,
      email: true,
      role_id: true,
      role: true,
      status: true,
      is_deleted: true,
      created_at: true,
      updated_at: true,
    };
  }

  const [data, total] = await Promise.all([
    client.user.findMany(appQuery as Prisma.UserFindManyArgs),
    client.user.count({ where: appQuery.where as Prisma.UserWhereInput }),
  ]);

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return {
    meta: {
      page,
      limit,
      total,
      total_page: Math.ceil(total / limit),
    },
    data,
  };
};

export const findById = async (id: number) => {
  return await client.user.findUnique({
    where: { id, is_deleted: false },
    include: {
      role: true,
      direct_permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const update = async (id: number, data: Prisma.UserUpdateInput) => {
  return await client.user.update({
    where: { id },
    data,
    include: { role: true },
  });
};

export const remove = async (id: number) => {
  return await client.user.delete({ where: { id } });
};

export const softDelete = async (id: number) => {
  return await client.user.update({
    where: { id },
    data: { is_deleted: true, deleted_at: new Date() },
  });
};

export const restore = async (id: number) => {
  return await client.user.update({
    where: { id },
    data: { is_deleted: false, deleted_at: null },
  });
};

export const assignPermission = async (
  user_id: number,
  permission_id: number,
) => {
  return await client.userPermission.create({
    data: {
      user_id,
      permission_id,
    },
  });
};

export const removePermission = async (
  user_id: number,
  permission_id: number,
) => {
  return await client.userPermission.delete({
    where: {
      user_id_permission_id: {
        user_id,
        permission_id,
      },
    },
  });
};
