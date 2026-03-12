import { Prisma } from '@prisma/client';
import { client } from '../../config/db';

export const create = async (data: {
  user_id: number;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Prisma.InputJsonValue;
  ip_address?: string;
}) => {
  return await client.auditLog.create({
    data,
  });
};

import AppQuery from '../../builder/app-query';

export const findAll = async (query: Record<string, unknown> = {}) => {
  const appQuery = new AppQuery(query)
    .search(['action', 'resource'])
    .filter()
    .sort()
    .paginate()
    .relations()
    .build();

  if (!appQuery.include) {
    appQuery.include = {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    };
  }

  const [data, total] = await Promise.all([
    client.auditLog.findMany(appQuery as Prisma.AuditLogFindManyArgs),
    client.auditLog.count({
      where: appQuery.where as Prisma.AuditLogWhereInput,
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

export const findByUserId = async (user_id: number) => {
  return await client.auditLog.findMany({
    where: { user_id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};
