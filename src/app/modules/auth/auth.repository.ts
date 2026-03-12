import { Prisma } from '@prisma/client';
import { client } from '../../config/db';

export const findById = async (id: number) => {
  return await client.user.findUnique({
    where: { id, is_deleted: false },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      direct_permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const findByEmail = async (email: string) => {
  return await client.user.findUnique({
    where: {
      email,
      is_deleted: false,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      direct_permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const create = async (data: Prisma.UserCreateInput) => {
  return await client.user.create({
    data,
    include: { role: true },
  });
};

export const update = async (id: number, data: Prisma.UserUpdateInput) => {
  return await client.user.update({
    where: { id },
    data,
  });
};
