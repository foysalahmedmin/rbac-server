import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../../builder/app-error';
import * as AuthRepository from '../auth.repository';
import * as AuthService from '../auth.service';

// Mock dependencies
jest.mock('../auth.repository');
jest.mock('bcrypt');
jest.mock('../../../utils/send-email');
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
    role: 'customer',
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

    it('should throw error if user is blocked', async () => {
      (AuthRepository.findByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'blocked',
      });

      await expect(
        AuthService.signIn({ email: 'test@example.com', password: 'any' }),
      ).rejects.toThrow(new AppError(httpStatus.FORBIDDEN, 'User is blocked!'));
    });
  });

  describe('signUp', () => {
    it('should successfully register a new user', async () => {
      (AuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (AuthRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.signUp({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(AuthRepository.create).toHaveBeenCalled();
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
