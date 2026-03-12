import { client } from '../../config/db';

export const findAll = async () => {
  return await client.permission.findMany();
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
