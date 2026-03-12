import { Prisma } from '@prisma/client';
import * as LeadRepository from './lead.repository';

export const findAll = async (query: Record<string, unknown>) => {
  return await LeadRepository.findAll(query);
};

export const findById = async (id: number) => {
  return await LeadRepository.findById(id);
};

export const create = async (data: Prisma.LeadCreateInput) => {
  return await LeadRepository.create(data);
};

export const update = async (id: number, data: Prisma.LeadUpdateInput) => {
  return await LeadRepository.update(id, data);
};

export const remove = async (id: number) => {
  return await LeadRepository.remove(id);
};
