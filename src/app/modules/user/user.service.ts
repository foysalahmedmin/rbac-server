import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import * as UserRepository from './user.repository';

export const getUsers = async () => {
  return await UserRepository.findAll();
};

export const getUser = async (id: number) => {
  const user = await UserRepository.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  return user;
};

export const updateUser = async (id: number, payload: any) => {
  const user = await UserRepository.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // If role is being updated, it should be handled by name or ID
  // For now, let's assume payload.role_id is passed if role is changed.

  return await UserRepository.update(id, payload);
};

export const deleteUser = async (id: number) => {
  const user = await UserRepository.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
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

export const updateMe = async (id: number, data: any) => {
  return await UserRepository.update(id, data);
};

export const suspendUser = async (id: number) => {
  return await UserRepository.update(id, { status: 'suspended' });
};

export const banUser = async (id: number) => {
  return await UserRepository.update(id, { status: 'banned' });
};

export const assignPermissionsToUser = async (
  user_id: number,
  permission_ids: number[],
) => {
  const user = await UserRepository.findById(user_id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const results = [];
  for (const permission_id of permission_ids) {
    try {
      const res = await UserRepository.assignPermission(user_id, permission_id);
      results.push(res);
    } catch {
      // Ignore if already assigned
    }
  }
  return results;
};
