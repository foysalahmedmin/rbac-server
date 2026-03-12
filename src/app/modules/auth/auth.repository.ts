import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client';

export const findById = async (id: number) => {
  return await prisma.user.findUnique({
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
  return await prisma.user.findUnique({
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
  return await prisma.user.create({
    data,
  });
};

export const update = async (id: number, data: Prisma.UserUpdateInput) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};
