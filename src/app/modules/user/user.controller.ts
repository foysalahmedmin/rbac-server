import { Request, Response } from 'express';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as UserService from './user.service';

export const getUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserService.getUsers();

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const result = await UserService.getUser(id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const result = await UserService.updateUser(id, req.body);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  await UserService.deleteUser(id);

  sendResponse(res, {
    status: 204,
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

export const restoreUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const result = await UserService.restoreUser(id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User restored successfully',
    data: result,
  });
});

export const permanentDeleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await UserService.permanentDeleteUser(id);

    sendResponse(res, {
      status: 204,
      success: true,
      message: 'User permanently deleted successfully',
      data: null,
    });
  },
);

export const getSelf = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as number;
  const result = await UserService.getSelf(userId);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

export const updateSelf = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as number;
  const result = await UserService.updateSelf(userId, req.body);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User profile updated successfully',
    data: result,
  });
});
