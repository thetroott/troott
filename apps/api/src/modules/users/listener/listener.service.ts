import { CreateListenerDTO, UpdateListenerDTO } from './listener.dto';
import listenerRepository from './listener.repository';
import { IResult } from '@/modules/shared/interfaces.util';
import type { IListenerDoc } from './listener.interface';
import type { IUserDoc } from '../user/user.interface';
import { UserType } from '../user/user.interface';
import { genSlug } from '../../../utils/helpers.util';
import roleService from '../../authentication/role/role.service';
import PermissionService from '../../authentication/permission/permission.service';

class ListenerService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    public async createListener(
        data: CreateListenerDTO,
    ): Promise<IResult<{ listener: IListenerDoc; user: IUserDoc }>> {
        const result: IResult<{ listener: IListenerDoc; user: IUserDoc }> = {
            error: false,
            message: '',
            code: 200,
            data: {} as { listener: IListenerDoc; user: IUserDoc },
        };

        const { user, ...rest } = data;
        if (!user) {
            result.error = true;
            result.code = 400;
            result.message =
                'User information is required to create a listener profile';
            return result;
        }

        const userKey = (user as IUserDoc & { id?: string })._id || user.id;
        const existing = await listenerRepository.findOne({ user: userKey });
        if (!existing.error && existing.data) {
            result.error = true;
            result.code = 400;
            result.message = 'Listener profile already exists for this user';
            return result;
        }

        const firstName = rest.firstName ?? user.firstName ?? '';
        const lastName = rest.lastName ?? user.lastName ?? '';
        const nameSlug = genSlug(
            `${firstName} ${lastName}`.trim() || (user.email ?? 'listener'),
        );

        const listenerData: Partial<IListenerDoc> = {
            firstName,
            lastName,
            email: (rest.email ?? user.email) as string,
            phoneNumber: user.phoneNumber ?? '',
            phoneCode: rest.phoneCode ?? user.phoneCode ?? '+234',
            country: rest.country ?? user.location?.country ?? '',
            countryPhone: '',
            dateOfBirth: rest.dateOfBirth,
            gender: (rest as { gender?: string }).gender ?? '',
            avatar:
                typeof user.avatar === 'string'
                    ? user.avatar
                    : (user.avatar as { s3Key?: string })?.s3Key ?? '',
            slug: rest.slug ?? nameSlug,
            playlists: [],
            listeningHistory: [],
            likedSermons: [],
            sharedSermons: [],
            viewedSermonBites: [],
            sharedSermonBites: [],
            savedSermonBites: [],
            followers: [],
            following: [],
            interests: [],
            badges: [],
            subscriptions: [],
            transactions: [],
            user: userKey as IListenerDoc['user'],
            createdBy: (rest.createdBy as any) || userKey,
        };

        const createResult = await listenerRepository.createListener(
            listenerData,
        );
        if (createResult.error || !createResult.data) {
            result.error = true;
            result.code = 500;
            result.message = createResult.message;
            return result;
        }

        if (!user.roles || user.roles.length === 0) {
            const roleAttachResult = await roleService.attachRole(
                user,
                UserType.LISTENER,
            );
            if (!roleAttachResult.error && roleAttachResult.data) {
                let updatedUser = roleAttachResult.data as IUserDoc;
                const permResult =
                    await PermissionService.initiatePermissionData(updatedUser);
                if (!permResult.error && permResult.data) {
                    updatedUser = permResult.data as IUserDoc;
                }
                const uid = updatedUser?._id || userKey;
                if (uid) {
                    await PermissionService.clearUserCache(String(uid));
                }
            }
        } else {
            const hasListenerRole = user.roles.some(
                (r: { name?: string; toString?: () => string }) =>
                    (r?.name || r?.toString?.()) === UserType.LISTENER,
            );
            if (!hasListenerRole) {
                const roleAttachResult = await roleService.attachRole(
                    user,
                    UserType.LISTENER,
                );
                if (!roleAttachResult.error && roleAttachResult.data) {
                    const updatedUser = roleAttachResult.data as IUserDoc;
                    const uid = updatedUser?._id || userKey;
                    if (uid) {
                        await PermissionService.clearUserCache(String(uid));
                    }
                }
            }
        }

        result.message = 'Listener profile created successfully';
        result.code = 201;
        result.data = {
            listener: createResult.data as IListenerDoc,
            user,
        };
        return result;
    }

    public async updateListener(
        userId: string,
        data: UpdateListenerDTO,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await listenerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Listener profile not found';
            return result;
        }

        const listener = findResult.data as IListenerDoc;
        const listenerId = String(listener._id || listener.id);

        const updateResult = await listenerRepository.updateListener(
            listenerId,
            { $set: { ...data } } as any,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Listener profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    public async getListenerProfile(userId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const listenerResult = await listenerRepository.findOne(
            { user: userId },
            {
                populate: [
                    { path: 'playlists' },
                    { path: 'listeningHistory' },
                    { path: 'following' },
                ],
            },
        );

        if (listenerResult.error || !listenerResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Listener profile not found';
            return result;
        }

        result.data = listenerResult.data;
        result.message = 'Listener profile retrieved successfully';
        return result;
    }

    public async addToListeningHistory(
        userId: string,
        sermonId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await listenerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.message = 'Listener profile not found';
            result.code = 404;
            return result;
        }

        const listener = findResult.data as IListenerDoc;
        const id = String(listener._id || listener.id);

        const updateResult = await listenerRepository.updateListener(id, {
            $push: {
                listeningHistory: { $each: [sermonId as any], $position: 0 },
            },
        } as any);

        if (updateResult.error) {
            result.error = true;
            result.message = updateResult.message;
            result.code = updateResult.code || 500;
            return result;
        }

        result.data = updateResult.data;
        result.message = 'Listening history updated';
        return result;
    }

    public async toggleLikeSermon(
        userId: string,
        sermonId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await listenerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.message = 'Listener profile not found';
            result.code = 404;
            return result;
        }

        const existingListener = findResult.data as IListenerDoc;
        const id = String(existingListener._id || existingListener.id);
        const likedIds = (existingListener.likedSermons as unknown[]).map(
            (x) => String(x),
        );
        const hasLiked = likedIds.includes(String(sermonId));

        const updateResult = await listenerRepository.updateListener(id, {
            ...(hasLiked
                ? { $pull: { likedSermons: sermonId as any } }
                : { $addToSet: { likedSermons: sermonId as any } }),
        } as any);

        if (updateResult.error) {
            result.error = true;
            result.message = updateResult.message;
            result.code = updateResult.code || 500;
            return result;
        }

        result.data = updateResult.data;
        result.message = hasLiked ? 'Sermon unliked' : 'Sermon liked';
        return result;
    }

    public async toggleFollow(
        userId: string,
        targetId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await listenerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.message = 'Listener profile not found';
            result.code = 404;
            return result;
        }

        const existingListener = findResult.data as IListenerDoc;
        const id = String(existingListener._id || existingListener.id);
        const followingIds = (existingListener.following as unknown[]).map(
            (x) => String(x),
        );
        const isFollowing = followingIds.includes(String(targetId));

        const updateResult = await listenerRepository.updateListener(id, {
            ...(isFollowing
                ? { $pull: { following: targetId as any } }
                : { $addToSet: { following: targetId as any } }),
        } as any);

        if (updateResult.error) {
            result.error = true;
            result.message = updateResult.message;
            result.code = updateResult.code || 500;
            return result;
        }

        result.data = updateResult.data;
        result.message = isFollowing
            ? 'Unfollowed successfully'
            : 'Followed successfully';
        return result;
    }

    public async updateInterests(
        userId: string,
        interests: string[],
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!interests || interests.length === 0) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid interests: must provide at least one interest';
            return result;
        }

        const findResult = await listenerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Listener profile not found';
            return result;
        }

        const listener = findResult.data as IListenerDoc;
        const listenerId = String(listener._id || listener.id);

        const updateResult = await listenerRepository.updateListener(
            listenerId,
            { interests } as any,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Interests updated successfully';
        result.data = (updateResult.data as IListenerDoc).interests;
        return result;
    }

    public async getEngagementStats(userId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const findResult = await listenerRepository.findOne({ user: userId });
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.message = 'Listener profile not found';
            result.code = 404;
            return result;
        }

        const listener = findResult.data as IListenerDoc;

        result.data = {
            totalSermons: listener.listeningHistory.length,
            likedSermons: listener.likedSermons.length,
            sharedSermons: listener.sharedSermons.length,
            following: listener.following.length,
            followers: listener.followers.length,
            playlists: listener.playlists.length,
            sermonBites: {
                viewed: listener.viewedSermonBites.length,
                shared: listener.sharedSermonBites.length,
                saved: listener.savedSermonBites.length,
            },
        };

        return result;
    }
}

export default new ListenerService();
