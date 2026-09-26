import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Role } from '../utils/token.util.js';
import type { UserStatus } from '../types/auth.types.js';
import { sendError } from '../utils/response.util.js';

type RequestWithUser = Request & {
  user?: { id: string; role: Role; status: UserStatus };
};

export function authorise(...allowedRoles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as RequestWithUser).user;

    if (!user) {
      sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
      return;
    }

    if (user.status !== 'APPROVED') {
      sendError(res, 403, 'Account is not yet approved.', 'ACCOUNT_NOT_APPROVED');
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      sendError(res, 403, 'Insufficient permissions.', 'FORBIDDEN');
      return;
    }

    next();
  };
}
