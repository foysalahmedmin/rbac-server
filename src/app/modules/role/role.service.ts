import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { client } from '../../config/db';
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

export const getRoles = async (query: Record<string, unknown>) => {
  return await RoleRepository.findAll(query);
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
  grantor_permissions: string[],
) => {
  const role = await RoleRepository.findById(role_id);
  if (!role) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }

  const results = [];
  for (const permission_id of permission_ids) {
    const permission = await client.permission.findUnique({
      where: { id: permission_id },
    });

    if (!permission) continue;

    // Grant Ceiling Check: User can only grant permissions they themselves possess
    if (!grantor_permissions.includes(permission.slug)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Grant Ceiling: You cannot grant the '${permission.slug}' permission because you don't have it yourself.`,
      );
    }

    try {
      const res = await RoleRepository.assignPermission(role_id, permission_id);
      results.push(res);
    } catch {
      // Ignore if already assigned
    }
  }
  return results;
};
