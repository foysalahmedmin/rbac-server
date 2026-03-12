import { Prisma } from '@prisma/client';
import * as AuditLogRepository from './audit-log.repository';

export const logAction = async (data: {
  user_id: number;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Prisma.InputJsonValue;
  ip_address?: string;
}) => {
  return await AuditLogRepository.create(data);
};

export const getAllLogs = async (query: Record<string, unknown>) => {
  return await AuditLogRepository.findAll(query);
};

export const getLogsByUser = async (user_id: number) => {
  return await AuditLogRepository.findByUserId(user_id);
};
