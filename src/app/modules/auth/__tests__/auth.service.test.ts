import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../../builder/app-error';
import { client } from '../../../config/db';
import * as AuthRepository from '../auth.repository';
import * as AuthService from '../auth.service';

// Mock dependencies
jest.mock('../auth.repository');
jest.mock('bcrypt');
jest.mock('../../../utils/send-email');
jest.mock('../../../config/db', () => ({
  client: {
    role: {
      findUnique: jest.fn(),
    },
    user: {
      create: jest.fn(),
    },
  },
}));
jest.mock('../auth.utils', () => ({
  ...jest.requireActual('../auth.utils'),
  createToken: jest.fn().mockReturnValue('mock-token'),
  isPasswordMatched: jest.fn().mockResolvedValue(true),
  verifyToken: jest.fn().mockReturnValue({ email: 'test@example.com' }),
}));

describe('AuthService', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    role: {
      name: 'customer',
      permissions: [
        {
          permission: {
            slug: 'test-permission',
          },
        },
      ],
    },
    direct_permissions: [],
    status: 'active',
    is_deleted: false,
    password_changed_at: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      (AuthRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.info.email).toBe(mockUser.email);
    });

    it('should throw error if user not found', async () => {
      (AuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.signIn({ email: 'wrong@example.com', password: 'any' }),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'User not found!'));
    });

    it('should throw error if user is suspended', async () => {
      (AuthRepository.findByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'suspended',
      });

      await expect(
        AuthService.signIn({ email: 'test@example.com', password: 'any' }),
      ).rejects.toThrow(
        new AppError(httpStatus.FORBIDDEN, 'User is suspended!'),
      );
    });
  });

  describe('signUp', () => {
    it('should successfully register a new user', async () => {
      (AuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (client.role.findUnique as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'customer',
      });
      (client.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.signUp({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(client.user.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      (AuthRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        AuthService.signUp({
          name: 'Existing User',
          email: 'test@example.com',
          password: 'any',
        }),
      ).rejects.toThrow(
        new AppError(httpStatus.CONFLICT, 'User already exists!'),
      );
    });
  });

  describe('isUserExist', () => {
    it('should return user if exists', async () => {
      (AuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      const result = await AuthService.isUserExist(1);
      expect(result).toEqual(mockUser);
    });
  });
});
