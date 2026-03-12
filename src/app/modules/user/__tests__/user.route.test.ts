import request from 'supertest';
import app from '../../../../app';
import * as UserService from '../user.service';

// Mock UserService
jest.mock('../user.service');

// Mock auth middleware to bypass it
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { id: 1, role: 'admin' };
    next();
  });
});

describe('User Routes', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/users/', () => {
    it('should return all users', async () => {
      (UserService.getUsers as jest.Mock).mockResolvedValue([mockUser]);

      const response = await request(app).get('/api/v1/users/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([mockUser]);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user profile', async () => {
      (UserService.getMe as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/v1/users/me');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockUser);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return a user by id', async () => {
      (UserService.getUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/v1/users/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockUser);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update a user', async () => {
      const updateData = { name: 'Updated' };
      (UserService.updateUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const response = await request(app)
        .patch('/api/v1/users/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should soft delete a user', async () => {
      (UserService.deleteUser as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/api/v1/users/1');

      expect(response.status).toBe(204);
    });
  });

  describe('PATCH /api/v1/users/:id/restore', () => {
    it('should restore a user', async () => {
      (UserService.restoreUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).patch('/api/v1/users/1/restore');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User restored successfully');
    });
  });
});
