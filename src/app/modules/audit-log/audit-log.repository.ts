import { client } from '../../config/db';

export const create = async (data: {
  user_id: number;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
}) => {
  return await client.auditLog.create({
    data,
  });
};

export const findAll = async () => {
  return await client.auditLog.findMany({
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
