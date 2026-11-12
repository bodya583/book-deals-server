import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export interface RequestValidators {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (validators: RequestValidators) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        const parsedParams = (await validators.params.parseAsync(req.params)) as any;
        Object.defineProperty(req, 'params', {
          value: parsedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (validators.query) {
        const parsedQuery = (await validators.query.parseAsync(req.query)) as any;
        // Express 5 defines `req.query` as a getter-only prototype property
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (validators.body) {
        req.body = (await validators.body.parseAsync(req.body)) as any;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
