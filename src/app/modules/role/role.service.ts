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

  // 1. Fetch all requested permissions to get their slugs
  const requestedPermissions = await client.permission.findMany({
    where: { id: { in: permission_ids } },
  });

  // 2. Grant Ceiling Check: User can only grant permissions they themselves possess
  for (const perm of requestedPermissions) {
    if (!grantor_permissions.includes(perm.slug)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Grant Ceiling: You cannot grant the '${perm.slug}' permission because you don't have it yourself.`,
      );
    }
  }

  // 3. Perform Sync in a Transaction
  return await client.$transaction(async (tx) => {
    // Remove all existing permissions for this role
    await tx.rolePermission.deleteMany({
      where: { role_id },
    });

    // Assign new permissions
    if (permission_ids.length > 0) {
      await tx.rolePermission.createMany({
        data: permission_ids.map((id) => ({
          role_id,
          permission_id: id,
        })),
      });
    }

    return await tx.role.findUnique({
      where: { id: role_id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  });
};
