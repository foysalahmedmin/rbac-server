import httpStatus from 'http-status';
import AppError from '../../../builder/app-error';
import { client } from '../../../config/db';
import * as RoleRepository from '../role.repository';
import * as RoleService from '../role.service';

// Mock RoleRepository
jest.mock('../role.repository');

// Mock client
jest.mock('../../../config/db', () => ({
  client: {
    permission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    rolePermission: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('RoleService', () => {
  const mockRole = {
    id: 1,
    name: 'admin',
    description: 'System Administrator',
  };

  const mockPaginatedResult = {
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      total_page: 1,
    },
    data: [mockRole],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('should successfully create a role', async () => {
      (RoleRepository.findByName as jest.Mock).mockResolvedValue(null);
      (RoleRepository.create as jest.Mock).mockResolvedValue(mockRole);

      const result = await RoleService.createRole({
        name: 'admin',
        description: 'System Administrator',
      });

      expect(result).toEqual(mockRole);
      expect(RoleRepository.create).toHaveBeenCalled();
    });

    it('should throw error if role already exists', async () => {
      (RoleRepository.findByName as jest.Mock).mockResolvedValue(mockRole);

      await expect(RoleService.createRole({ name: 'admin' })).rejects.toThrow(
        new AppError(httpStatus.CONFLICT, 'Role already exists!'),
      );
    });
  });

  describe('getRoles', () => {
    it('should return all roles with pagination', async () => {
      (RoleRepository.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const result = await RoleService.getRoles({});
      expect(result).toEqual(mockPaginatedResult);
      expect(RoleRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getRoleById', () => {
    it('should return a role by id', async () => {
      (RoleRepository.findById as jest.Mock).mockResolvedValue(mockRole);
      const result = await RoleService.getRoleById(1);
      expect(result).toEqual(mockRole);
      expect(RoleRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error if role not found', async () => {
      (RoleRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(RoleService.getRoleById(1)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Role not found!'),
      );
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      const updateData = { description: 'Updated' };
      (RoleRepository.findById as jest.Mock).mockResolvedValue(mockRole);
      (RoleRepository.update as jest.Mock).mockResolvedValue({
        ...mockRole,
        ...updateData,
      });

      const result = await RoleService.updateRole(1, updateData);
      expect(result.description).toBe('Updated');
      expect(RoleRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteRole', () => {
    it('should remove a role', async () => {
      (RoleRepository.findById as jest.Mock).mockResolvedValue(mockRole);
      (RoleRepository.remove as jest.Mock).mockResolvedValue(mockRole);

      const result = await RoleService.deleteRole(1);
      expect(result).toEqual(mockRole);
      expect(RoleRepository.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('assignPermissionsToRole', () => {
    it('should successfully assign permissions to a role', async () => {
      (RoleRepository.findById as jest.Mock).mockResolvedValue(mockRole);
      (client.permission.findMany as jest.Mock).mockResolvedValue([
        { id: 1, slug: 'manage_users' },
      ]);
      (client.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback(client);
        },
      );
      (client.rolePermission.deleteMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (client.rolePermission.createMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (client.role.findUnique as jest.Mock).mockResolvedValue({
        ...mockRole,
        permissions: [{ permission: { id: 1, slug: 'manage_users' } }],
      });

      const result = await RoleService.assignPermissionsToRole(
        1,
        [1],
        ['manage_users'],
      );

      expect(result!.permissions).toHaveLength(1);
      expect(client.rolePermission.deleteMany).toHaveBeenCalled();
      expect(client.rolePermission.createMany).toHaveBeenCalled();
    });

    it('should throw error if grantor lacks permission (Grant Ceiling)', async () => {
      (RoleRepository.findById as jest.Mock).mockResolvedValue(mockRole);
      (client.permission.findMany as jest.Mock).mockResolvedValue([
        { id: 1, slug: 'manage_roles' },
      ]);

      await expect(
        RoleService.assignPermissionsToRole(1, [1], ['manage_users']),
      ).rejects.toThrow(
        new AppError(
          httpStatus.FORBIDDEN,
          "Grant Ceiling: You cannot grant the 'manage_roles' permission because you don't have it yourself.",
        ),
      );
    });
  });
});
