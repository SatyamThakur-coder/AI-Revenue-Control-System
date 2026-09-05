import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { sendError } from '../utils/response';

export function tenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.organizationId) {
    return sendError(res, 'Organization context missing from request', 400, 'ORG_CONTEXT_MISSING');
  }
  next();
}
