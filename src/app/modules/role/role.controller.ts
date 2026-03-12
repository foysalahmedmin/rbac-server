import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as RoleServices from './role.service';

export const createRole = catchAsync(async (req, res) => {
  const result = await RoleServices.createRole(req.body);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Role created successfully',
    data: result,
  });
});

export const getRoles = catchAsync(async (_req, res) => {
  const result = await RoleServices.getRoles();
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Roles fetched successfully',
    data: result,
  });
});

export const getRoleById = catchAsync(async (req, res) => {
  const result = await RoleServices.getRoleById(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Role fetched successfully',
    data: result,
  });
});

export const updateRole = catchAsync(async (req, res) => {
  const result = await RoleServices.updateRole(Number(req.params.id), req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Role updated successfully',
    data: result,
  });
});

export const deleteRole = catchAsync(async (req, res) => {
  const result = await RoleServices.deleteRole(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Role deleted successfully',
    data: result,
  });
});

export const assignPermissions = catchAsync(async (req, res) => {
  const { role_id, permission_ids } = req.body;
  const result = await RoleServices.assignPermissionsToRole(
    role_id,
    permission_ids,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Permissions assigned successfully',
    data: result,
  });
});
