import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../builder/app-error';
import catchAsync from '../utils/catch-async';

const access = (permission_slug: string) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const user = req.user;

      if (!user) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You are not authenticated!',
        );
      }

      const hasPermission = user.permissions.includes(permission_slug);

      if (!hasPermission) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `You do not have the required permission: ${permission_slug}`,
        );
      }

      next();
    },
  );
};

export default access;
