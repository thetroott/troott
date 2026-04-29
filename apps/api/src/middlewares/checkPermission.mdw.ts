import { Request, Response, NextFunction } from 'express';
import asyncHandler from './async.mdw';
import PermissionService from '../modules/authentication/permission/permission.service';

type PermInput = string | { entity: string; action: string };

/**
 * options:
 * - ownerParam: string (path or body param name to extract resource owner id)
 * - ownerResolver: async function (req) => ownerId to support custom resource lookup
 * - checkOwnership: boolean (defaults true)
 */
export default function checkPermission(
    perm: PermInput | PermInput[],
    options?: {
        ownerParam?: string;
        ownerResolver?: (
            req: Request,
        ) => Promise<string | null> | string | null;
        checkOwnership?: boolean;
    },
) {
    return asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const user = (req as any).user;
            if (!user)
                return res
                    .status(401)
                    .json({ error: true, message: 'Unauthorized' });

            const checkOwnership = options?.checkOwnership ?? true;

            // Determine resource owner id if provided
            let resourceOwnerId: string | null = null;
            if (options?.ownerResolver) {
                resourceOwnerId = await options.ownerResolver(req);
            } else if (options?.ownerParam) {
                // look in params, body, or query
                resourceOwnerId =
                    (req.params && req.params[options.ownerParam]) ||
                    (req.body && req.body[options.ownerParam]) ||
                    (req.query && (req.query as any)[options.ownerParam]) ||
                    null;
            }

            const permsToCheck = Array.isArray(perm) ? perm : [perm];

            for (const p of permsToCheck) {
                const ok = await PermissionService.hasPermission(
                    user,
                    p as any,
                    { resourceOwnerId, checkOwnership },
                );
                if (ok) return next();
            }

            return res.status(403).json({ error: true, message: 'Forbidden' });
        },
    );
}
