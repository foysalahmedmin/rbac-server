import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import * as RoleRepository from './role.repository';

export const createRole = async (payload: {
  name: string;
  description?: string;
}) => {
  const isExist = await RoleRepository.findByName(payload.name);
  if (isExist) {
    throw new AppError(httpStatus.CONFLICT, 'Role already exists!');
  }
  return await RoleRepository.create(payload);
};

export const getRoles = async () => {
  return await RoleRepository.findAll();
};

export const getRoleById = async (id: number) => {
  const role = await RoleRepository.findById(id);
  if (!role) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }
  return role;
};

export const updateRole = async (
  id: number,
  payload: { name?: string; description?: string },
) => {
  const role = await RoleRepository.findById(id);
  if (!role) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }
  return await RoleRepository.update(id, payload);
};

export const deleteRole = async (id: number) => {
  const role = await RoleRepository.findById(id);
  if (!role) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }
  return await RoleRepository.remove(id);
};

export const assignPermissionsToRole = async (
  role_id: number,
  permission_ids: number[],
) => {
  const role = await RoleRepository.findById(role_id);
  if (!role) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }

  // Remove existing permissions if needed or just add new ones
  // For simplicity, we'll just add the ones provided.
  // A professional implementation would probably sync them.

  const results = [];
  for (const permission_id of permission_ids) {
    try {
      const res = await RoleRepository.assignPermission(role_id, permission_id);
      results.push(res);
    } catch {
      // Ignore if already assigned
    }
  }
  return results;
};
