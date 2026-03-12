import { Prisma } from '@prisma/client';
import { client } from '../../config/db';

export const findById = async (id: number) => {
  return await client.user.findUnique({
    where: { id, is_deleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      status: true,
      is_deleted: true,
      password_changed_at: true,
    },
  });
};

export const findByEmail = async (email: string) => {
  return await client.user.findUnique({
    where: {
      email,
      is_deleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      status: true,
      is_deleted: true,
      password_changed_at: true,
    },
  });
};

export const create = async (data: Prisma.UserCreateInput) => {
  return await client.user.create({
    data,
  });
};

export const update = async (id: number, data: Prisma.UserUpdateInput) => {
  return await client.user.update({
    where: { id },
    data,
  });
};
