import type {
    MinisterProfileDTO,
    MinisterResponseDTO,
} from '@/dtos/core/minister.dto';
import type IMinisterDoc from '@/interfaces/core/minister.interface';
import { UserType } from '@/interfaces/user.interface';
import { toStoragePublicUrl } from '@/utils/helpers.util';

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
            avatarOut = toStoragePublicUrl(m.avatar);
        } else {
            avatarOut = toStoragePublicUrl(m.avatar?.s3Key);
        }

        let bannerOut: string | undefined;
        if (typeof m.banner === 'string') {
            bannerOut = toStoragePublicUrl(m.banner);
        } else {
            bannerOut = toStoragePublicUrl(m.banner?.s3Key);
        }

        let profileOut: MinisterResponseDTO['profile'];
        if (m.profile) {
            profileOut = {
                description: m.profile.description,
                ministerialName: m.profile.ministerialName,
                ministryName: m.profile.ministryName,
                ministryLogo: toStoragePublicUrl(m.profile.ministryLogo),
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
            profileAvatar = toStoragePublicUrl(m.avatar);
        } else if (m.avatar?.s3Key != null) {
            profileAvatar = toStoragePublicUrl(m.avatar.s3Key);
        } else {
            profileAvatar = null;
        }

        let profileCover: string | null;
        if (typeof m.banner === 'string') {
            profileCover = toStoragePublicUrl(m.banner);
        } else if (m.banner?.s3Key != null) {
            profileCover = toStoragePublicUrl(m.banner.s3Key);
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
            ministryLogo: toStoragePublicUrl(prof.ministryLogo),
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

    public async mapMinisterOwnerResponse(
        minister: IMinisterDoc,
    ): Promise<Record<string, unknown>> {
        const m = minister as any;
        const doc =
            typeof m.toObject === 'function'
                ? m.toObject({ virtuals: true })
                : { ...m };

        if (typeof doc.avatar === 'string') {
            doc.avatar = toStoragePublicUrl(doc.avatar);
        } else if (doc.avatar?.s3Key) {
            doc.avatar = toStoragePublicUrl(doc.avatar.s3Key);
        }

        if (typeof doc.banner === 'string') {
            doc.banner = toStoragePublicUrl(doc.banner);
        } else if (doc.banner?.s3Key) {
            doc.banner = toStoragePublicUrl(doc.banner.s3Key);
        }

        if (doc.profile && typeof doc.profile === 'object') {
            doc.profile = { ...doc.profile };
            if (doc.profile.ministryLogo) {
                doc.profile.ministryLogo = toStoragePublicUrl(
                    doc.profile.ministryLogo,
                );
            }
        }

        if (doc.verification?.document) {
            doc.verification = { ...doc.verification };
            doc.verification.document = { ...doc.verification.document };
            if (doc.verification.document.frontPage) {
                doc.verification.document.frontPage = toStoragePublicUrl(
                    doc.verification.document.frontPage,
                );
            }
            if (doc.verification.document.backPage) {
                doc.verification.document.backPage = toStoragePublicUrl(
                    doc.verification.document.backPage,
                );
            }
        }

        if (Array.isArray(doc.sermons)) {
            doc.sermons = doc.sermons.map((sermon: any) => {
                const s = { ...sermon };
                if (typeof s.imageUrl === 'string') {
                    s.imageUrl = toStoragePublicUrl(s.imageUrl);
                }
                return s;
            });
        }

        return doc;
    }
}

export default new MinisterMapper();
