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
        req.params = (await validators.params.parseAsync(req.params)) as any;
      }
      if (validators.query) {
        req.query = (await validators.query.parseAsync(req.query)) as any;
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
