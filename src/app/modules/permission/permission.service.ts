import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import * as PermissionRepository from './permission.repository';

export const getPermissions = async () => {
  return await PermissionRepository.findAll();
};

export const getPermissionById = async (id: number) => {
  const permission = await PermissionRepository.findById(id);
  if (!permission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Permission not found!');
  }
  return permission;
};
