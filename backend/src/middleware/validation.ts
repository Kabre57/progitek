import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiResponse } from '../models';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors?.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        })) || []
      } as ApiResponse);
    }
  };
};