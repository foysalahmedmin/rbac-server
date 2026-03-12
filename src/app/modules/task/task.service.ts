import { Prisma } from '@prisma/client';
import * as TaskRepository from './task.repository';

export const findAll = async (query: Record<string, unknown>) => {
  return await TaskRepository.findAll(query);
};

export const findById = async (id: number) => {
  return await TaskRepository.findById(id);
};

export const create = async (data: Prisma.TaskCreateInput) => {
  return await TaskRepository.create(data);
};

export const update = async (id: number, data: Prisma.TaskUpdateInput) => {
  return await TaskRepository.update(id, data);
};

export const remove = async (id: number) => {
  return await TaskRepository.remove(id);
};
