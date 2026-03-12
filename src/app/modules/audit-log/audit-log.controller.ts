import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as AuditLogServices from './audit-log.service';

export const getAuditLogs = catchAsync(async (_req, res) => {
  const result = await AuditLogServices.getAllLogs();
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Audit logs fetched successfully',
    data: result,
  });
});

export const getMyLogs = catchAsync(async (req, res) => {
  const userId = req.user?.id as number;
  const result = await AuditLogServices.getLogsByUser(userId);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Your audit logs fetched successfully',
    data: result,
  });
});
