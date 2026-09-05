import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { sendError } from '../utils/response';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        403,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
}
