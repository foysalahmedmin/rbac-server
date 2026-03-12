import { Prisma } from '@prisma/client';
import { TErrorResponse, TSources } from '../types/error-response.type';

const handleDuplicateError = (
  err: Prisma.PrismaClientKnownRequestError,
): TErrorResponse => {
  const status = 409;
  const message = (err.message as string) || 'Duplicate entry';
  const targets = (err.meta?.target as string[]) || ['unknown'];
  const sources: TSources = targets.map((field) => ({
    path: field,
    message: `${field} already exists`,
  }));

  return {
    status,
    message,
    sources,
  };
};

export default handleDuplicateError;
