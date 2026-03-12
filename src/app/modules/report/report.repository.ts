import { Prisma } from '@prisma/client';
import AppQuery from '../../builder/app-query';
import { client } from '../../config/db';

export const findAll = async (query: Record<string, unknown>) => {
  const appQuery = new AppQuery(query)
    .search(['name', 'type'])
    .filter()
    .sort()
    .paginate()
    .build();

  const [data, total] = await Promise.all([
    client.report.findMany(appQuery as Prisma.ReportFindManyArgs),
    client.report.count({ where: appQuery.where as Prisma.ReportWhereInput }),
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
  return await client.report.findUnique({
    where: { id },
  });
};

export const create = async (data: Prisma.ReportCreateInput) => {
  return await client.report.create({
    data,
  });
};

export const update = async (id: number, data: Prisma.ReportUpdateInput) => {
  return await client.report.update({
    where: { id },
    data,
  });
};

export const remove = async (id: number) => {
  return await client.report.delete({
    where: { id },
  });
};
