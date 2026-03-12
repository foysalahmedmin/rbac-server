import request from 'supertest';
import app from '../../../../app';
import * as AuthService from '../auth.service';

// Mock AuthService
jest.mock('../auth.service');

describe('Auth Routes', () => {
  const mockTokenResponse = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    info: { id: 1, name: 'Test', email: 'test@example.com', role: 'customer' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should successfully sign up a user', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue(mockTokenResponse);

      const response = await request(app).post('/api/v1/auth/signup').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        email: 'invalid-email',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/signin', () => {
    it('should successfully sign in a user', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue(mockTokenResponse);

      const response = await request(app).post('/api/v1/auth/signin').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
    });
  });
});
