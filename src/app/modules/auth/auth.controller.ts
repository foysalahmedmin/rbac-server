import httpStatus from 'http-status';
import { env } from '../../config/env';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as AuthServices from './auth.service';

export const signIn = catchAsync(async (req, res) => {
  const { refresh_token, access_token, info } = await AuthServices.signIn(
    req.body,
  );

  res.cookie('refresh_token', refresh_token, {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
  });

  res.cookie('access_token', access_token, {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User is singed in successfully!',
    data: {
      token: access_token,
      info: info,
    },
  });
});

export const signUp = catchAsync(async (req, res) => {
  const { refresh_token, access_token, info } = await AuthServices.signUp(
    req.body,
  );

  res.cookie('refresh_token', refresh_token, {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
  });

  res.cookie('access_token', access_token, {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User is singed up successfully!',
    data: {
      token: access_token,
      info: info,
    },
  });
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refresh_token } = req.cookies;
  const result = await AuthServices.refreshToken(refresh_token);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePassword(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password is changed successfully!',
    data: result,
  });
});

export const forgetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgetPassword(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password reset link is sent successfully!',
    data: result,
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization as string;
  const result = await AuthServices.resetPassword(req.body, token);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password is reset successfully!',
    data: result,
  });
});
