import httpStatus from 'http-status';
import AppError from '../../../builder/app-error';
import * as PermissionRepository from '../permission.repository';
import * as PermissionService from '../permission.service';

// Mock PermissionRepository
jest.mock('../permission.repository');

describe('PermissionService', () => {
  const mockPermission = {
    id: 1,
    name: 'Manage Users',
    slug: 'manage_users',
    module: 'user',
  };

  const mockPaginatedResult = {
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      total_page: 1,
    },
    data: [mockPermission],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPermissions', () => {
    it('should return all permissions with pagination', async () => {
      (PermissionRepository.findAll as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );
      const result = await PermissionService.getPermissions({});
      expect(result).toEqual(mockPaginatedResult);
      expect(PermissionRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getPermissionById', () => {
    it('should return a permission by id', async () => {
      (PermissionRepository.findById as jest.Mock).mockResolvedValue(
        mockPermission,
      );
      const result = await PermissionService.getPermissionById(1);
      expect(result).toEqual(mockPermission);
      expect(PermissionRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error if permission not found', async () => {
      (PermissionRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(PermissionService.getPermissionById(1)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Permission not found!'),
      );
    });
  });
});
