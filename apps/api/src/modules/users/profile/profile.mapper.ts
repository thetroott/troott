import type { IUserDoc } from '../user/user.interface';
import { UserType } from '../user/user.interface';
import type { IMinisterDoc } from '../minister/minister.interface';
import type {
    BaseProfileDTO,
    ListenerProfileDTO,
    MinisterProfileDTO,
    ProfileDTO,
} from './profile.dto';

/**
 * @name profileMapper
 * @description Joins the `User` and (optional) `Minister` Mongo docs into the
 * canonical `ProfileDTO`. Inheritance is realised via composition: minister
 * payloads call `mapBase` first and then layer on ministry fields.
 */
class ProfileMapper {
    private mapBase(user: IUserDoc): BaseProfileDTO {
        const raw =
            (user as unknown as { _id?: unknown; id?: unknown })._id ??
            (user as unknown as { id?: unknown }).id;
        const id = raw != null ? String(raw) : '';
        return {
            id,
            userType: user.userType,
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            email: user.email ?? '',
            slug: user.slug,
            bio: user.bio,
            avatar:
                user.avatar && user.avatar.s3Key ? user.avatar : null,
            coverImage:
                user.coverImage && user.coverImage.s3Key
                    ? user.coverImage
                    : null,
            createdAt:
                user.createdAt instanceof Date
                    ? user.createdAt.toISOString()
                    : String(user.createdAt ?? ''),
            updatedAt:
                user.updatedAt instanceof Date
                    ? user.updatedAt.toISOString()
                    : String(user.updatedAt ?? ''),
        };
    }

    public toDTO(
        user: IUserDoc,
        minister?: IMinisterDoc | null,
    ): ProfileDTO {
        const base = this.mapBase(user);

        if (user.userType !== UserType.MINISTER) {
            return { ...base, userType: user.userType } as ListenerProfileDTO;
        }

        const m: MinisterProfileDTO = {
            ...base,
            userType: UserType.MINISTER,
            ministerialName: minister?.ministerialName,
            ministryName: minister?.ministryName ?? minister?.ministry,
            ministryHQLocation: minister?.ministryHQLocation,
            ministryWebsite: minister?.ministryWebsite,
            socials: minister?.socials as MinisterProfileDTO['socials'],
        };
        return m;
    }
}

export default new ProfileMapper();
