import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../builder/app-error';
import { env } from '../config/env';
import * as AuthServices from '../modules/auth/auth.service';
import { TJwtPayload } from '../modules/auth/auth.type';
import { isJWTIssuedBeforePasswordChanged } from '../modules/auth/auth.utils';
import { TRole } from '../types/role.type';
import { userStorage } from '../utils/async-storage';
import catchAsync from '../utils/catch-async';

const auth = (...roles: TRole[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      let token = req.headers.authorization;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You do not have the necessary permissions to access this resource.',
        );
      }

      if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      const decoded = jwt.verify(
        token,
        env.jwt_access_secret as string,
      ) as JwtPayload;

      const { id, role } = decoded;

      const user = await AuthServices.isUserExist(id);

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
      }

      if (user?.is_deleted) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
      }

      if (user?.status === 'suspended' || user?.status === 'banned') {
        throw new AppError(httpStatus.FORBIDDEN, `User is ${user.status}!`);
      }

      if (
        user.password_changed_at &&
        isJWTIssuedBeforePasswordChanged(
          user.password_changed_at,
          decoded.iat as number,
        )
      ) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      if (roles && roles.length > 0 && !roles.includes(role)) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You do not have the necessary permissions to access this resource.',
        );
      }

      req.user = decoded as TJwtPayload;
      userStorage.run({ id: user.id }, () => {
        next();
      });
    },
  );
};

export default auth;
