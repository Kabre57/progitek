import { Request, Response } from 'express';
import { ApiResponse } from '../models';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} non trouvée`,
  } as ApiResponse);
};