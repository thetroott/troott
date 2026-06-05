import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '@/middlewares/async.mdw';
import ErrorResponse from '@/utils/error.util';
import studioService, {
    type CreateStudioResult,
} from '@/services/core/studio.service';
import studioMapper from '@/mappers/studio.mapper';
import type { CreateStudioDTO, UpdateStudioDTO } from '@/dtos/core/studio.dto';
import type IStudioDoc from '@/interfaces/core/studio.interface';
import { UserType } from '@/interfaces/user.interface';

function isPlatformAdmin(req: Request): boolean {
    const user = (req as any).user ?? {};
    const userType = String(user?.userType ?? '').toLowerCase();
    return (
        user?.isAdmin === true ||
        user?.isSuper === true ||
        userType === UserType.ADMIN ||
        userType === UserType.SUPERADMIN
    );
}

export const createStudio: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const body = req.body as CreateStudioDTO;
        if (!body?.name?.trim()) {
            return next(new ErrorResponse('name is required', 400, []));
        }
        if (!body?.category) {
            return next(new ErrorResponse('category is required', 400, []));
        }

        const result = await studioService.createStudio(userId, body, {
            isPlatformAdmin: isPlatformAdmin(req),
        });
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }
        const { studio, ownerMinisterId, ownerCreatorId } =
            result.data as CreateStudioResult;
        const sid = String(studio._id);
        await studioService.linkStudioToProfiles(
            sid,
            userId,
            ownerMinisterId,
            ownerCreatorId,
        );

        res.status(201).json({
            error: false,
            errors: [],
            data: studioMapper.mapStudio(studio),
            message: result.message,
            status: 201,
        });
    },
);

export const getStudio: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        if (!id) return next(new ErrorResponse('id is required', 400, []));
        const result = await studioService.getStudioById(id);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 404, []),
            );
        }
        res.status(200).json({
            error: false,
            errors: [],
            data: studioMapper.mapStudio(result.data!.studio),
            message: result.message,
            status: 200,
        });
    },
);

export const getMyStudio: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        const result = await studioService.getMyPrimaryStudio(userId);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }
        const { studio, role } = result.data!;
        res.status(200).json({
            error: false,
            errors: [],
            data: {
                studio: studio ? studioMapper.mapStudio(studio) : null,
                role,
            },
            message: result.message,
            status: 200,
        });
    },
);

export const listMyStudios: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        const page = req.query.page
            ? parseInt(String(req.query.page), 10)
            : undefined;
        const result = await studioService.listMine(userId, page);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }
        const raw = result.data as { data?: unknown[] } | unknown[] | undefined;
        let data: unknown = raw;
        if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.data)) {
            data = {
                ...raw,
                data: raw.data.map((row) =>
                    studioMapper.mapStudio(row as IStudioDoc),
                ),
            };
        } else if (Array.isArray(raw)) {
            data = raw.map((row) =>
                studioMapper.mapStudio(row as IStudioDoc),
            );
        }
        res.status(200).json({
            error: false,
            errors: [],
            data,
            message: result.message || 'OK',
            status: 200,
        });
    },
);

export const patchStudio: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        const studioId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        if (!studioId) return next(new ErrorResponse('id is required', 400, []));

        const dto: UpdateStudioDTO = {
            studioId,
            ...req.body,
        };
        const result = await studioService.updateStudio(userId, dto);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }
        res.status(200).json({
            error: false,
            errors: [],
            data: studioMapper.mapStudio(result.data!.studio),
            message: result.message,
            status: 200,
        });
    },
);

export const postStudioInvite: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        const studioId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        if (!studioId) {
            return next(new ErrorResponse('studio id is required', 400, []));
        }
        const result = await studioService.createInvite(userId, {
            studioId,
            email: req.body.email,
            userId: req.body.userId,
            role: req.body.role,
            expiresAt: req.body.expiresAt,
        });
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }
        res.status(result.code || 201).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: result.code || 201,
        });
    },
);

export const deleteStudioInvite: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        const { id: studioId, inviteId } = req.params;
        if (!studioId || !inviteId) {
            return next(
                new ErrorResponse('studio id and invite id are required', 400, []),
            );
        }
        const result = await studioService.cancelInvite(
            userId,
            studioId,
            inviteId,
        );
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }
        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message: result.message,
            status: 200,
        });
    },
);

export const acceptStudioInvite: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        const { id: studioId, inviteId } = req.params;
        if (!studioId || !inviteId) {
            return next(
                new ErrorResponse('studio id and invite id are required', 400, []),
            );
        }
        const result = await studioService.acceptInvite(userId, studioId, inviteId);
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }
        res.status(200).json({
            error: false,
            errors: [],
            data: studioMapper.mapStudio(result.data!.studio),
            message: result.message,
            status: 200,
        });
    },
);

export const rejectStudioInvite: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = String((req.user as { id?: string } | undefined)?.id ?? '');
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));
        const { id: studioId, inviteId } = req.params;
        if (!studioId || !inviteId) {
            return next(
                new ErrorResponse('studio id and invite id are required', 400, []),
            );
        }
        const result = await studioService.rejectInvite(
            userId,
            studioId,
            inviteId,
        );
        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 400, []),
            );
        }
        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message: result.message,
            status: 200,
        });
    },
);
