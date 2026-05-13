import type {
    MinisterProfileDTO,
    MinisterResponseDTO,
} from '@/dtos/core/minister.dto';
import type IMinisterDoc from '@/interfaces/core/minister.interface';
import { UserType } from '@/interfaces/user.interface';

const idOf = (doc: unknown): string => {
    if (doc == null) {
        return '';
    }
    const d = doc as { _id?: unknown; id?: unknown };
    if (d._id != null) {
        return String(d._id);
    }
    if (d.id != null) {
        return String(d.id);
    }
    return '';
};

class MinisterMapper {
    public async mapMinisterResponse(
        minister: IMinisterDoc,
    ): Promise<MinisterResponseDTO> {
        const m = minister as any;
        const v = m.verification;

        let avatarOut: string | undefined;
        if (typeof m.avatar === 'string') {
            avatarOut = m.avatar;
        } else {
            avatarOut = m.avatar?.s3Key;
        }

        let bannerOut: string | undefined;
        if (typeof m.banner === 'string') {
            bannerOut = m.banner;
        } else {
            bannerOut = m.banner?.s3Key;
        }

        let profileOut: MinisterResponseDTO['profile'];
        if (m.profile) {
            profileOut = {
                description: m.profile.description,
                ministerialName: m.profile.ministerialName,
                ministryName: m.profile.ministryName,
                ministryLogo: m.profile.ministryLogo,
                ministryType: m.profile.ministryType,
                ministryHQLocation: m.profile.ministryHQLocation,
                phoneNumber: m.profile.phoneNumber,
                phoneCode: m.profile.phoneCode,
                countryPhone: m.profile.countryPhone,
                email: m.profile.email,
                websiteUrl: m.profile.websiteUrl,
                socials: m.profile.socials ?? [],
                languages: m.profile.languages ?? [],
            };
        } else {
            profileOut = undefined;
        }

        let verificationOut: MinisterResponseDTO['verification'];
        if (v) {
            verificationOut = {
                status: v.status,
                isVerified: Boolean(v.isVerified),
                isPublic: Boolean(v.isPublic),
                verifiedAt: v.verifiedAt,
            };
        } else {
            verificationOut = undefined;
        }

        return {
            id: idOf(minister),
            code: m.code ?? '',
            firstName: m.firstName ?? '',
            lastName: m.lastName ?? '',
            middleName: m.middleName,
            email: m.email ?? '',
            slug: m.slug ?? '',
            gender: m.gender,
            dateOfBirth: m.dateOfBirth,
            phoneNumber: m.phoneNumber,
            phoneCode: m.phoneCode,
            countryPhone: m.countryPhone,
            country: m.country,
            homeCountry: m.homeCountry,
            avatar: avatarOut,
            banner: bannerOut,
            profile: profileOut,
            onboarding: m.onboarding,
            verification: verificationOut,
            status: m.status,
            published: Boolean(m.published),
            monthlyListeners: m.monthlyListeners ?? 0,
            createdAt: m.createdAt ?? '',
            updatedAt: m.updatedAt ?? '',
        };
    }

    public async mapMinisterProfile(
        minister: IMinisterDoc,
    ): Promise<MinisterProfileDTO> {
        const m = minister as any;
        const prof = m.profile ?? {};

        let profileAvatar: string | null;
        if (typeof m.avatar === 'string') {
            profileAvatar = m.avatar;
        } else if (m.avatar?.s3Key != null) {
            profileAvatar = m.avatar.s3Key;
        } else {
            profileAvatar = null;
        }

        let profileCover: string | null;
        if (typeof m.banner === 'string') {
            profileCover = m.banner;
        } else if (m.banner?.s3Key != null) {
            profileCover = m.banner.s3Key;
        } else {
            profileCover = null;
        }

        return {
            id: idOf(minister),
            code: m.code ?? '',
            userType: UserType.MINISTER,
            firstName: m.firstName ?? '',
            lastName: m.lastName ?? '',
            email: m.email ?? '',
            slug: m.slug,
            bio: prof.description,
            avatar: profileAvatar,
            coverImage: profileCover,
            ministerialName: prof.ministerialName,
            ministryName: prof.ministryName,
            ministryLogo: prof.ministryLogo,
            ministryType: prof.ministryType,
            ministryHQLocation: prof.ministryHQLocation,
            ministryWebsite: prof.websiteUrl,
            socials: prof.socials,
            languages: prof.languages,
            monthlyListeners: m.monthlyListeners,
            isVerified: m.verification?.isVerified,
            isPublic: m.verification?.isPublic,
            createdAt: m.createdAt ?? '',
            updatedAt: m.updatedAt ?? '',
        };
    }
}

export default new MinisterMapper();
