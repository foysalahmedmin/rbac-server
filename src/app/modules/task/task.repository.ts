import { Prisma } from '@prisma/client';
import AppQuery from '../../builder/app-query';
import { client } from '../../config/db';

export const findAll = async (query: Record<string, unknown>) => {
  const appQuery = new AppQuery(query)
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .build();

  if (!appQuery.include) {
    appQuery.include = {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };
  }

  const [data, total] = await Promise.all([
    client.task.findMany(appQuery as Prisma.TaskFindManyArgs),
    client.task.count({ where: appQuery.where as Prisma.TaskWhereInput }),
  ]);

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return {
    meta: {
      page,
      limit,
      total,
      total_page: Math.ceil(total / limit),
    },
    data,
  };
};

export const findById = async (id: number) => {
  return await client.task.findUnique({
    where: { id },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const create = async (data: Prisma.TaskCreateInput) => {
  return await client.task.create({
    data,
  });
};

export const update = async (id: number, data: Prisma.TaskUpdateInput) => {
  return await client.task.update({
    where: { id },
    data,
  });
};

export const remove = async (id: number) => {
  return await client.task.delete({
    where: { id },
  });
};
