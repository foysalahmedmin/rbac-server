import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import prisma from '../../../prisma/client';
import AppError from '../../builder/app-error';
import { env } from '../../config/env';
import { sendEmail } from '../../utils/send-email';
import {
  TChangePassword,
  TForgetPassword,
  TJwtPayload,
  TResetPassword,
  TSignIn,
  TSignUp,
} from './auth.type';
import { createToken, isPasswordMatched, verifyToken } from './auth.utils';

// === Find user by id
export const isUserExist = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id, is_deleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      status: true,
      is_deleted: true,
    },
  });
};

// === Find user by custom email field
export const isUserExistByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
      is_deleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      status: true,
      is_deleted: true,
    },
  });
};

export const signIn = async (payload: TSignIn) => {
  const user = await isUserExistByEmail(payload.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  if (!(await isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched!');
  }

  const jwtPayload: TJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    env.jwt_access_secret,
    env.jwt_access_secret_expires_in,
  );

  const refreshToken = createToken(
    jwtPayload,
    env.jwt_refresh_secret,
    env.jwt_refresh_secret_expires_in,
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    info: jwtPayload,
  };
};

export const signUp = async (payload: TSignUp) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.bcrypt_salt_rounds),
  );
  payload.password = hashedPassword;
  payload.role = payload.role || 'customer';

  const exist = await isUserExistByEmail(payload.email);
  if (exist) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists!');
  }

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    },
  });

  const jwtPayload: TJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    env.jwt_access_secret,
    env.jwt_access_secret_expires_in,
  );

  const refreshToken = createToken(
    jwtPayload,
    env.jwt_refresh_secret,
    env.jwt_refresh_secret_expires_in,
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    info: jwtPayload,
  };
};

export const refreshToken = async (token: string) => {
  const { email } = verifyToken(token, env.jwt_refresh_secret);

  const user = await isUserExistByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  const jwtPayload: TJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    env.jwt_access_secret,
    env.jwt_access_secret_expires_in,
  );

  return {
    token: accessToken,
    info: jwtPayload,
  };
};

export const changePassword = async (payload: TChangePassword) => {
  const user = await isUserExistByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is deleted!');
  }

  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.NOT_FOUND, 'User is blocked!');
  }

  if (!(await isPasswordMatched(payload?.current_password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched!');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.new_password,
    Number(env.bcrypt_salt_rounds),
  );

  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedNewPassword,
      updated_at: new Date(),
    },
  });

  return result;
};

export const forgetPassword = async (payload: TForgetPassword) => {
  const user = await isUserExistByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  const jwtPayload: TJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = createToken(
    jwtPayload,
    env.jwt_access_secret,
    env.jwt_access_secret_expires_in,
  );

  const resetUILink = `${env.reset_password_ui_link}?id=${user.id}&token=${token}`;

  await sendEmail({
    to: user.email,
    subject: 'rbac Password Change Link',
    text: 'Reset your password within 10 minutes',
    html: resetUILink,
  });

  return null;
};

export const resetPassword = async (payload: TResetPassword, token: string) => {
  const user = await isUserExistByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  const { email } = verifyToken(token, env.jwt_access_secret);

  if (payload.email !== email) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is forbidden!');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.bcrypt_salt_rounds),
  );

  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      updated_at: new Date(),
    },
  });

  return result;
};
