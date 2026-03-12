import { Prisma } from '@prisma/client';
import AppQuery from '../../builder/app-query';
import { client } from '../../config/db';

export const findAll = async (query: Record<string, unknown> = {}) => {
  const appQuery = new AppQuery(query)
    .search(['name', 'slug', 'module'])
    .filter()
    .sort()
    .paginate()
    .build();

  const [data, total] = await Promise.all([
    client.permission.findMany(appQuery as Prisma.PermissionFindManyArgs),
    client.permission.count({
      where: appQuery.where as Prisma.PermissionWhereInput,
    }),
  ]);

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

export const findById = async (id: number) => {
  return await client.permission.findUnique({
    where: { id },
  });
};

export const findBySlug = async (slug: string) => {
  return await client.permission.findUnique({
    where: { slug },
  });
};
