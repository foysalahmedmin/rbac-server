import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client';

export const findAll = async () => {
  return await prisma.user.findMany({
    select: { password: false },
  });
};

export const findById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { password: false },
  });
};

export const update = async (id: number, data: Prisma.UserUpdateInput) => {
  return await prisma.user.update({ where: { id }, data });
};

export const remove = async (id: number) => {
  return await prisma.user.delete({ where: { id } });
};

export const softDelete = async (id: number) => {
  return await prisma.user.update({
    where: { id },
    data: { is_deleted: true, deleted_at: new Date() },
  });
};

export const restore = async (id: number) => {
  return await prisma.user.update({
    where: { id },
    data: { is_deleted: false, deleted_at: null },
  });
};
