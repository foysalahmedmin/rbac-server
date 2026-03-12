import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as ReportServices from './report.service';

export const getAllReports = catchAsync(async (req, res) => {
  const result = await ReportServices.findAll(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reports retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getReportById = catchAsync(async (req, res) => {
  const result = await ReportServices.findById(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Report retrieved successfully',
    data: result,
  });
});

export const createReport = catchAsync(async (req, res) => {
  const result = await ReportServices.create(req.body);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Report created successfully',
    data: result,
  });
});

export const updateReport = catchAsync(async (req, res) => {
  const result = await ReportServices.update(Number(req.params.id), req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Report updated successfully',
    data: result,
  });
});

export const deleteReport = catchAsync(async (req, res) => {
  await ReportServices.remove(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Report deleted successfully',
    data: null,
  });
});
