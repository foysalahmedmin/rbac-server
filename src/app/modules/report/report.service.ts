import { Prisma } from '@prisma/client';
import * as ReportRepository from './report.repository';

export const findAll = async (query: Record<string, unknown>) => {
  return await ReportRepository.findAll(query);
};

export const findById = async (id: number) => {
  return await ReportRepository.findById(id);
};

export const create = async (data: Prisma.ReportCreateInput) => {
  return await ReportRepository.create(data);
};

export const update = async (id: number, data: Prisma.ReportUpdateInput) => {
  return await ReportRepository.update(id, data);
};

export const remove = async (id: number) => {
  return await ReportRepository.remove(id);
};
