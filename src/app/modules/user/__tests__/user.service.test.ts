import * as UserRepository from '../user.repository';
import * as UserService from '../user.service';

// Mock UserRepository
jest.mock('../user.repository');

// Mock client
jest.mock('../../../config/db', () => ({
  client: {
    permission: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    userPermission: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import httpStatus from 'http-status';
import AppError from '../../../builder/app-error';
import { client } from '../../../config/db';

describe('UserService', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: { id: 1, name: 'customer' },
    status: 'active',
    is_deleted: false,
  };

  const mockPaginatedResult = {
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      total_page: 1,
    },
    data: [mockUser],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users with pagination', async () => {
      (UserRepository.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const result = await UserService.getUsers({});
      expect(result).toEqual(mockPaginatedResult);
      expect(UserRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getUser', () => {
    it('should return a single user by id', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      const result = await UserService.getUser(1);
      expect(result).toEqual(mockUser);
      expect(UserRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateData = { name: 'Updated Name' };
      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (UserRepository.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      });
      const result = await UserService.updateUser(1, updateData);
      expect(result.name).toBe('Updated Name');
      expect(UserRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (UserRepository.softDelete as jest.Mock).mockResolvedValue({
        ...mockUser,
        is_deleted: true,
      });
      const result = await UserService.deleteUser(1);
      expect(result.is_deleted).toBe(true);
      expect(UserRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('permanentDeleteUser', () => {
    it('should permanently remove a user', async () => {
      (UserRepository.remove as jest.Mock).mockResolvedValue(mockUser);
      const result = await UserService.permanentDeleteUser(1);
      expect(result).toEqual(mockUser);
      expect(UserRepository.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('restoreUser', () => {
    it('should restore a soft-deleted user', async () => {
      (UserRepository.restore as jest.Mock).mockResolvedValue({
        ...mockUser,
        is_deleted: false,
      });
      const result = await UserService.restoreUser(1);
      expect(result.is_deleted).toBe(false);
      expect(UserRepository.restore).toHaveBeenCalledWith(1);
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      const result = await UserService.getMe(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('assignPermissionsToUser', () => {
    it('should successfully assign direct permissions to a user', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (client.permission.findMany as jest.Mock).mockResolvedValue([
        { id: 1, slug: 'manage_users' },
      ]);
      (client.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback(client);
        },
      );
      (client.userPermission.deleteMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (client.userPermission.createMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (client.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        direct_permissions: [{ permission: { id: 1, slug: 'manage_users' } }],
      });

      const result = await UserService.assignPermissionsToUser(
        1,
        [1],
        ['manage_users'],
      );

      expect(result!.direct_permissions).toHaveLength(1);
      expect(client.userPermission.deleteMany).toHaveBeenCalled();
      expect(client.userPermission.createMany).toHaveBeenCalled();
    });

    it('should throw error if grantor lacks permission (Grant Ceiling)', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (client.permission.findMany as jest.Mock).mockResolvedValue([
        { id: 1, slug: 'manage_roles' },
      ]);

      await expect(
        UserService.assignPermissionsToUser(1, [1], ['manage_users']),
      ).rejects.toThrow(
        new AppError(
          httpStatus.FORBIDDEN,
          "Grant Ceiling: You cannot grant the 'manage_roles' permission because you don't have it yourself.",
        ),
      );
    });
  });
});
