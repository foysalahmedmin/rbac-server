import { Prisma } from '@prisma/client';
import AppQuery from '../../builder/app-query';
import { client } from '../../config/db';

export const findAll = async (query: Record<string, unknown>) => {
  const appQuery = new AppQuery(query)
    .search(['first_name', 'last_name', 'email'])
    .filter()
    .sort()
    .paginate()
    .build();

  const [data, total] = await Promise.all([
    client.lead.findMany(appQuery as Prisma.LeadFindManyArgs),
    client.lead.count({ where: appQuery.where as Prisma.LeadWhereInput }),
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
  return await client.lead.findUnique({
    where: { id },
  });
};

export const create = async (data: Prisma.LeadCreateInput) => {
  return await client.lead.create({
    data,
  });
};

export const update = async (id: number, data: Prisma.LeadUpdateInput) => {
  return await client.lead.update({
    where: { id },
    data,
  });
};

export const remove = async (id: number) => {
  return await client.lead.delete({
    where: { id },
  });
};
