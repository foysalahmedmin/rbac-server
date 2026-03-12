import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as PermissionServices from './permission.service';

export const getPermissions = catchAsync(async (req, res) => {
  const result = await PermissionServices.getPermissions();
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Permissions fetched successfully',
    data: result,
  });
});

export const getPermissionById = catchAsync(async (req, res) => {
  const result = await PermissionServices.getPermissionById(
    Number(req.params.id),
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Permission fetched successfully',
    data: result,
  });
});
