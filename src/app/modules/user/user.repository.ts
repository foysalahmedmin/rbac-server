import { Prisma } from '@prisma/client';
import { client } from '../../config/db';

export const findAll = async () => {
  return await client.user.findMany({
    where: { is_deleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      role_id: true,
      role: true,
      status: true,
      is_deleted: true,
      created_at: true,
      updated_at: true,
    },
  });
};

export const findById = async (id: number) => {
  return await client.user.findUnique({
    where: { id, is_deleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      role_id: true,
      role: true,
      status: true,
      is_deleted: true,
      created_at: true,
      updated_at: true,
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
