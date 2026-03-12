import request from 'supertest';
import app from '../../../../app';
import * as RoleService from '../role.service';

// Mock RoleService
jest.mock('../role.service');

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

describe('Role Routes', () => {
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

  describe('POST /api/v1/roles/', () => {
    it('should successfully create a role', async () => {
      (RoleService.createRole as jest.Mock).mockResolvedValue(mockRole);

      const response = await request(app)
        .post('/api/v1/roles/')
        .send({ name: 'admin', description: 'desc' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRole);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/v1/roles/')
        .send({ name: '' }); // Invalid name

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/roles/', () => {
    it('should return all roles with pagination', async () => {
      (RoleService.getRoles as jest.Mock).mockResolvedValue(
        mockPaginatedResult,
      );

      const response = await request(app).get('/api/v1/roles/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.meta).toEqual(mockPaginatedResult.meta);
      expect(response.body.data).toEqual(mockPaginatedResult.data);
    });
  });

  describe('GET /api/v1/roles/:id', () => {
    it('should return a role by id', async () => {
      (RoleService.getRoleById as jest.Mock).mockResolvedValue(mockRole);

      const response = await request(app).get('/api/v1/roles/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockRole);
    });
  });

  describe('PATCH /api/v1/roles/:id', () => {
    it('should update a role', async () => {
      const updateData = { description: 'Updated' };
      (RoleService.updateRole as jest.Mock).mockResolvedValue({
        ...mockRole,
        ...updateData,
      });

      const response = await request(app)
        .patch('/api/v1/roles/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated');
    });
  });

  describe('DELETE /api/v1/roles/:id', () => {
    it('should delete a role', async () => {
      (RoleService.deleteRole as jest.Mock).mockResolvedValue(mockRole);

      const response = await request(app).delete('/api/v1/roles/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/roles/assign-permissions', () => {
    it('should successfully assign permissions', async () => {
      (RoleService.assignPermissionsToRole as jest.Mock).mockResolvedValue([
        { role_id: 1, permission_id: 1 },
      ]);

      const response = await request(app)
        .post('/api/v1/roles/assign-permissions')
        .send({ role_id: 1, permission_ids: [1] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});
