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

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as number;
  const result = await UserService.getMe(userId);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as number;
  const result = await UserService.updateMe(userId, req.body);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User profile updated successfully',
    data: result,
  });
});

export const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const result = await UserService.suspendUser(id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User suspended successfully',
    data: result,
  });
});

export const banUser = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const result = await UserService.banUser(id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User banned successfully',
    data: result,
  });
});

export const assignPermissions = catchAsync(
  async (req: Request, res: Response) => {
    const { user_id, permission_ids } = req.body;
    const grantor_permissions = req.user?.permissions || [];
    const result = await UserService.assignPermissionsToUser(
      user_id,
      permission_ids,
      grantor_permissions,
    );

    sendResponse(res, {
      status: 200,
      success: true,
      message: 'Permissions assigned to user successfully',
      data: result,
    });
  },
);
