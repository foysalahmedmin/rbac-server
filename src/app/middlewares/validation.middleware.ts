import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

const validation = (schema: ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        params: req.params,
        query: req.query,
        body: req.body,
        cookies: req.cookies,
        session: (req as Request & { session?: unknown }).session,
      })) as { body: unknown };

      req.body = parsed.body;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validation;
