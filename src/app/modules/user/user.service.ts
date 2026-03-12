/* eslint-disable no-console */
import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/client';

export const getUsers = async () => {
  return await prisma.user.findMany({
    select: { password: false },
  });
};

export const getUser = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { password: false },
  });
};

export const updateUser = async (id: number, data: Prisma.UserUpdateInput) => {
  return await prisma.user.update({ where: { id }, data });
};

export const deleteUser = async (id: number) => {
  return await prisma.user.delete({ where: { id } });
};

export const getSelf = async (id: number) => {
  return await prisma.user.findUnique({ where: { id } });
};

export const updateSelf = async (id: number, data: Prisma.UserUpdateInput) => {
  return await prisma.user.update({ where: { id }, data });
};
