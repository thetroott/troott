import type { IResult } from '@/utils/interfaces.util';
import userRepository from '@/repository/user.repository';
import ministerRepository from '@/repository/minister.repository';
import storageService from '@/services/storage.service';
import { UserType, type IUserDoc, type Upload } from '@/modules/users/user/user.interface';
import type { IMinisterDoc } from '@/modules/users/minister/minister.interface';
import profileMapper from '@/mappers/profile.mapper';
import type { ProfileDTO, UpdateProfilePayloadDTO } from '@/dtos/profile.dto';

/**
 * @name profileService
 * @description Encapsulates the join across `User` and `Minister` collections.
 * This is the only place outside the controller that knows the data is split
 * across two collections.
 */
class ProfileService {
    /**
     * Read the joined profile DTO. Lazy-creates the Minister doc on first read
     * for a fresh minister account so the editor always has a stable backing row.
     */
    public async getMyProfile(userId: string): Promise<IResult<ProfileDTO>> {
        const userResult = await userRepository.findById(userId, false);
        if (userResult.error || !userResult.data) {
            return {
                error: true,
                code: 404,
                message: 'User not found',
                data: null,
            };
        }
        const user = userResult.data as IUserDoc;

        let minister: IMinisterDoc | null = null;
        if (user.userType === UserType.MINISTER) {
            const found = await ministerRepository.findOne({ user: userId });
            if (!found.error && found.data) {
                minister = found.data as IMinisterDoc;
            } else {
                const created = await ministerRepository.createMinister({
                    user: (user as { _id: any })._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                });
                if (!created.error && created.data) {
                    minister = created.data as IMinisterDoc;
                }
            }
        }

        return {
            error: false,
            code: 200,
            message: 'Profile retrieved successfully',
            data: profileMapper.toDTO(user, minister),
        };
    }

    /**
     * Apply a partial profile update. Base fields go to the `User` doc; ministry
     * fields go to the `Minister` doc. Replaced/removed image assets are deleted
     * from S3 to avoid orphans.
     */
    public async updateMyProfile(
        userId: string,
        payload: UpdateProfilePayloadDTO,
    ): Promise<IResult<ProfileDTO>> {
        const userResult = await userRepository.findById(userId, false);
        if (userResult.error || !userResult.data) {
            return {
                error: true,
                code: 404,
                message: 'User not found',
                data: null,
            };
        }
        const user = userResult.data as IUserDoc;

        // Forbid ministry payload from listeners / non-minister roles.
        if (
            payload.ministry !== undefined &&
            user.userType !== UserType.MINISTER
        ) {
            return {
                error: true,
                code: 403,
                message: 'Ministry fields are only editable by ministers',
                data: null,
            };
        }

        const userPatch: Partial<IUserDoc> = {};
        if (payload.bio !== undefined) {
            userPatch.bio = payload.bio.trim();
        }

        if (payload.avatar !== undefined) {
            await this.cleanupReplacedAsset(user.avatar, payload.avatar);
            userPatch.avatar = (payload.avatar ?? undefined) as Upload;
        }
        if (payload.coverImage !== undefined) {
            await this.cleanupReplacedAsset(user.coverImage, payload.coverImage);
            userPatch.coverImage = (payload.coverImage ?? undefined) as Upload;
        }

        if (Object.keys(userPatch).length > 0) {
            const updated = await userRepository.updateUser(userId, userPatch);
            if (updated.error) {
                return {
                    error: true,
                    code: updated.code ?? 500,
                    message: updated.message,
                    data: null,
                };
            }
        }

        let minister: IMinisterDoc | null = null;
        if (user.userType === UserType.MINISTER) {
            const found = await ministerRepository.findOne({ user: userId });
            if (!found.error && found.data) {
                minister = found.data as IMinisterDoc;
            }

            if (payload.ministry) {
                if (!minister) {
                    const created = await ministerRepository.createMinister({
                        user: (user as { _id: any })._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        ...payload.ministry,
                    });
                    minister = (created.data as IMinisterDoc) ?? null;
                } else {
                    const ministerId = String(
                        (minister as { _id?: any; id?: any })._id ??
                            minister.id,
                    );
                    const ministerPatch: Partial<IMinisterDoc> = {};
                    if (payload.ministry.ministerialName !== undefined) {
                        ministerPatch.ministerialName =
                            payload.ministry.ministerialName.trim();
                    }
                    if (payload.ministry.ministryName !== undefined) {
                        ministerPatch.ministryName =
                            payload.ministry.ministryName.trim();
                    }
                    if (payload.ministry.ministryHQLocation !== undefined) {
                        ministerPatch.ministryHQLocation =
                            payload.ministry.ministryHQLocation.trim();
                    }
                    if (payload.ministry.ministryWebsite !== undefined) {
                        ministerPatch.ministryWebsite =
                            payload.ministry.ministryWebsite.trim();
                    }
                    if (payload.ministry.socials !== undefined) {
                        ministerPatch.socials = {
                            instagram: payload.ministry.socials.instagram,
                            twitter: payload.ministry.socials.twitter,
                            tiktok: payload.ministry.socials.tiktok,
                        };
                    }
                    if (Object.keys(ministerPatch).length > 0) {
                        const updated = await ministerRepository.updateMinister(
                            ministerId,
                            ministerPatch,
                        );
                        if (!updated.error) {
                            minister = updated.data as IMinisterDoc;
                        }
                    }
                }
            }
        }

        const refreshed = await userRepository.findById(userId, false);
        const finalUser =
            !refreshed.error && refreshed.data
                ? (refreshed.data as IUserDoc)
                : user;

        return {
            error: false,
            code: 200,
            message: 'Profile updated successfully',
            data: profileMapper.toDTO(finalUser, minister),
        };
    }

    /**
     * Delete the previous S3 object when the asset is replaced or cleared.
     * Best-effort: storage failures don't block the profile update.
     */
    private async cleanupReplacedAsset(
        previous: Upload | undefined | null,
        next: Upload | null,
    ): Promise<void> {
        const prevKey = previous?.s3Key;
        const nextKey = next?.s3Key;
        if (!prevKey) return;
        if (prevKey === nextKey) return;
        try {
            await storageService.deleteFile(prevKey);
        } catch {
            // intentional: orphan cleanup is best-effort
        }
    }
}

export default new ProfileService();
