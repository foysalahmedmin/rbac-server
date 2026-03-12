import { Prisma } from '@prisma/client';
import * as UserRepository from './user.repository';

export const getUsers = async () => {
  return await UserRepository.findAll();
};

export const getUser = async (id: number) => {
  return await UserRepository.findById(id);
};

export const updateUser = async (id: number, data: Prisma.UserUpdateInput) => {
  return await UserRepository.update(id, data);
};

export const deleteUser = async (id: number) => {
  return await UserRepository.softDelete(id);
};

export const permanentDeleteUser = async (id: number) => {
  return await UserRepository.remove(id);
};

export const restoreUser = async (id: number) => {
  return await UserRepository.restore(id);
};

export const getMe = async (id: number) => {
  return await UserRepository.findById(id);
};

export const updateMe = async (id: number, data: Prisma.UserUpdateInput) => {
  return await UserRepository.update(id, data);
};
