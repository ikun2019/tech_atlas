import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Role } from '../types/index.js';

export function authorize(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'このリソースへのアクセス権限がありません',
          statusCode: 403,
        },
      });
      return;
    }
    next();
  };
}
