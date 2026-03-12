import { Prisma } from '@prisma/client';
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from '../builder/app-error';
import { env } from '../config/env';
import handleDuplicateError from '../errors/handle-duplicate-error';
import handleValidationError from '../errors/handle-validation-error';
import handleZodError from '../errors/handle-zod-error';
import { TSources } from '../types/error-response.type';

const error: ErrorRequestHandler = (error, _req, res, _next) => {
  let status = 500;
  let message = 'Something went wrong!';
  let sources: TSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    status = simplifiedError?.status;
    message = simplifiedError?.message;
    sources = simplifiedError?.sources;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handleValidationError(error);
    status = simplifiedError?.status;
    message = simplifiedError?.message;
    sources = simplifiedError?.sources;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handleDuplicateError(error);
    status = simplifiedError?.status;
    message = simplifiedError?.message;
    sources = simplifiedError?.sources;
  } else if (error instanceof AppError) {
    status = error?.status;
    message = error.message;
    sources = [
      {
        path: '',
        message: error?.message,
      },
    ];
  } else if (error instanceof Error) {
    message = error.message;
    sources = [
      {
        path: '',
        message: error?.message,
      },
    ];
  }

  res.status(status).json({
    success: false,
    status,
    message,
    sources,
    error,
    stack: env.NODE_ENV === 'development' ? error?.stack : null,
  });
  return;
};

export default error;
