import * as AuditLogRepository from './audit-log.repository';

export const logAction = async (data: {
  user_id: number;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
}) => {
  return await AuditLogRepository.create(data);
};

export const getAllLogs = async () => {
  return await AuditLogRepository.findAll();
};

export const getLogsByUser = async (user_id: number) => {
  return await AuditLogRepository.findByUserId(user_id);
};
