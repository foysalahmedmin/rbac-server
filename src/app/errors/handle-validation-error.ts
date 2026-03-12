import { Prisma } from '@prisma/client';
import { TErrorResponse, TSources } from '../types/error-response.type';

const handleValidationError = (
  err: Prisma.PrismaClientValidationError,
): TErrorResponse => {
  const status = 400;
  const message = (err.message as string) || 'Validation Error';
  const sources: TSources = [
    {
      path: '',
      message,
    },
  ];

  return {
    status,
    message,
    sources,
  };
};

export default handleValidationError;
