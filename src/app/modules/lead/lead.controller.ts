import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as LeadServices from './lead.service';

export const getAllLeads = catchAsync(async (req, res) => {
  const result = await LeadServices.findAll(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Leads retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getLeadById = catchAsync(async (req, res) => {
  const result = await LeadServices.findById(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Lead retrieved successfully',
    data: result,
  });
});

export const createLead = catchAsync(async (req, res) => {
  const result = await LeadServices.create(req.body);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Lead created successfully',
    data: result,
  });
});

export const updateLead = catchAsync(async (req, res) => {
  const result = await LeadServices.update(Number(req.params.id), req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Lead updated successfully',
    data: result,
  });
});

export const deleteLead = catchAsync(async (req, res) => {
  await LeadServices.remove(Number(req.params.id));
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Lead deleted successfully',
    data: null,
  });
});
