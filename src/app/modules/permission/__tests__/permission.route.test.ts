import request from 'supertest';
import app from '../../../../app';
import * as PermissionService from '../permission.service';

// Mock PermissionService
jest.mock('../permission.service');

// Mock auth middleware to bypass it
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { id: 1, role: 'admin', permissions: ['manage_roles'] };
    next();
  });
});

// Mock access middleware to bypass it
jest.mock('../../../middlewares/access.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => {
    next();
  });
});

describe('Permission Routes', () => {
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

  describe('GET /api/v1/permissions/', () => {
    it('should return all permissions with pagination', async () => {
      (PermissionService.getPermissions as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );

      const response = await request(app).get('/api/v1/permissions/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.meta).toEqual(mockPaginatedResult.meta);
      expect(response.body.data).toEqual(mockPaginatedResult.data);
    });
  });

  describe('GET /api/v1/permissions/grouped', () => {
    it('should return grouped permissions', async () => {
      const mockGrouped = {
        user: [mockPermission],
        role: [
          {
            id: 2,
            name: 'Manage Roles',
            slug: 'manage_roles',
            module: 'role',
          },
        ],
      };
      (
        PermissionService.getGroupedPermissions as jest.Mock
      ).mockResolvedValue(mockGrouped);

      const response = await request(app).get(
        '/api/v1/permissions/grouped',
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGrouped);
    });
  });

  describe('GET /api/v1/permissions/:id', () => {
    it('should return a permission by id', async () => {
      (PermissionService.getPermissionById as jest.Mock).mockResolvedValue(
        mockPermission,
      );

      const response = await request(app).get('/api/v1/permissions/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPermission);
    });
  });
});
