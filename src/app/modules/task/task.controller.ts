import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as TaskServices from './task.service';

export const getAllTasks = catchAsync(async (req, res) => {
  const result = await TaskServices.findAll(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Tasks retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getTaskById = catchAsync(async (req, res) => {
  const result = await TaskServices.findById(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Task retrieved successfully',
    data: result,
  });
});

export const createTask = catchAsync(async (req, res) => {
  const result = await TaskServices.create(req.body);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Task created successfully',
    data: result,
  });
});

export const updateTask = catchAsync(async (req, res) => {
  const result = await TaskServices.update(Number(req.params.id), req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Task updated successfully',
    data: result,
  });
});

export const deleteTask = catchAsync(async (req, res) => {
  await TaskServices.remove(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Task deleted successfully',
    data: null,
  });
});
