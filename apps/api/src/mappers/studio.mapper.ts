import type IStudioDoc from '@/interfaces/core/studio.interface';
import type { StudioMember, StudioInvite } from '@/interfaces/core/studio.interface';
import { toStoragePublicUrl } from '@/utils/helpers.util';

function idOf(v: unknown): string {
    if (v == null) return '';
    if (typeof v === 'object' && '_id' in (v as object)) {
        return String((v as { _id: unknown })._id);
    }
    return String(v);
}

function mapProfile(profile: unknown): Record<string, unknown> {
    if (!profile || typeof profile !== 'object') return {};
    const p = profile as Record<string, unknown>;
    const hq = (p.ministryHQLocation as Record<string, unknown>) || {};
    return {
        description: p.description,
        ministryName: p.ministryName,
        ministryLogo: p.ministryLogo
            ? toStoragePublicUrl(String(p.ministryLogo))
            : p.ministryLogo,
        banner: p.banner ? toStoragePublicUrl(String(p.banner)) : p.banner,
        ministryType: p.ministryType,
        ministryHQLocation: {
            address: hq.address,
            city: hq.city,
            state: hq.state,
            country: hq.country,
            postalCode: hq.postalCode,
        },
        phoneNumber: p.phoneNumber,
        phoneCode: p.phoneCode,
        countryPhone: p.countryPhone,
        email: p.email,
        websiteUrl: p.websiteUrl,
        socials: p.socials,
        languages: p.languages,
        members: Array.isArray(p.members)
            ? (p.members as unknown[]).map((m) => idOf(m))
            : [],
    };
}

class StudioMapper {
    public mapStudio(studio: IStudioDoc | null | undefined): Record<string, unknown> {
        if (!studio) return {};
        const doc = studio as unknown as Record<string, unknown>;
        return {
            id: idOf(doc._id),
            code: doc.code,
            slug: doc.slug,
            name: doc.name,
            country: doc.country,
            avatar: doc.avatar
                ? toStoragePublicUrl(String(doc.avatar))
                : doc.avatar,
            email: doc.email,
            profile: mapProfile(doc.profile),
            parentStudio: doc.parentStudio ? idOf(doc.parentStudio) : undefined,
            category: doc.category,
            isPublic: doc.isPublic,
            isVerified: doc.isVerified,
            followers: doc.followers,
            totalListeners: doc.totalListeners,
            monthlyListeners: doc.monthlyListeners,
            totalSermons: doc.totalSermons,
            totalSeries: doc.totalSeries,
            totalPlays: doc.totalPlays,
            tags: doc.tags,
            topics: Array.isArray(doc.topics)
                ? (doc.topics as unknown[]).map((t) => idOf(t))
                : [],
            status: doc.status,
            members: Array.isArray(doc.members)
                ? (doc.members as StudioMember[]).map((m) => ({
                      user: idOf(m.user),
                      role: m.role,
                      joinedAt: m.joinedAt,
                      invitedBy: m.invitedBy ? idOf(m.invitedBy) : undefined,
                      permissions: m.permissions,
                  }))
                : [],
            invites: Array.isArray(doc.invites)
                ? (doc.invites as StudioInvite[]).map((i) => ({
                      id: idOf((i as unknown as { _id?: unknown })._id),
                      user: i.user ? idOf(i.user) : undefined,
                      email: i.email,
                      role: i.role,
                      invitedBy: idOf(i.invitedBy),
                      invitedAt: i.invitedAt,
                      expiresAt: i.expiresAt,
                  }))
                : [],
            createdBy: doc.createdBy ? idOf(doc.createdBy) : undefined,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}

export default new StudioMapper();
