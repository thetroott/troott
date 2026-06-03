import mongoose from 'mongoose';
import type { IResult } from '@/interfaces/common.interface';
import type IStudioDoc from '@/interfaces/core/studio.interface';
import {
    StudioRole,
    StudioStatus,
    StudioType,
} from '@/interfaces/core/studio.interface';
import type { IUserDoc } from '@/interfaces/user.interface';
import studioRepository from '@/repository/core/studio.repository';
import ministerRepository from '@/repository/core/minister.repository';
import creatorRepository from '@/repository/core/creator.repository';
import userRepository from '@/repository/user.repository';
import { genSlug, generateRandomChars } from '@/utils/helpers.util';
import type {
    CreateStudioDTO,
    CreateStudioInviteDTO,
    UpdateStudioDTO,
} from '@/dtos/core/studio.dto';
import type { ICountry } from '@/interfaces/common.interface';

const STUDIO_RESERVED_SLUGS = new Set(
    [
        'admin',
        'api',
        'v1',
        'studios',
        'studio',
        'settings',
        'help',
        'login',
        'register',
        'oauth',
        'webhook',
        'open',
        'share',
        'static',
        'assets',
        'health',
        'me',
        'new',
        'edit',
        'search',
        'discover',
        'user',
        'users',
        'minister',
        'ministers',
        'creator',
        'creators',
        'listener',
        'listeners',
        'playlist',
        'playlists',
        'sermon',
        'sermons',
        'series',
        'playback',
        'plans',
        'subscriptions',
        'invitation',
        'invitations',
        'null',
        'undefined',
    ].map((s) => s.toLowerCase()),
);

const MAX_CODE_ATTEMPTS = 10;
const MAX_SLUG_ATTEMPTS = 10;

export type CreateStudioResult = {
    studio: IStudioDoc;
    ownerMinisterId?: string;
    ownerCreatorId?: string;
};

export type ProvisionDefaultStudioResult = {
    studio: IStudioDoc | null;
    created: boolean;
};

function emptyCountry(): ICountry {
    return {
        name: '',
        code2: '',
        code3: '',
        capital: '',
        region: '',
        subregion: '',
        states: [],
        slug: '',
        timezones: [],
        flag: '',
        base64: '',
        currencyCode: '',
        currencyImage: '',
        phoneCode: '',
    };
}

function emptyProfile(): IStudioDoc['profile'] {
    return {
        description: '',
        ministryName: '',
        ministryLogo: '',
        banner: '',
        ministryType: '',
        ministryHQLocation: {
            address: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
        },
        phoneNumber: '',
        phoneCode: '',
        countryPhone: '',
        email: '',
        websiteUrl: '',
        socials: [],
        languages: [],
        members: [],
    };
}

function uid(v: unknown): string {
    if (!v) return '';
    if (typeof v === 'object' && v !== null && '_id' in v) {
        return String((v as { _id: unknown })._id);
    }
    return String(v);
}

export function getUserStudioRole(
    studio: IStudioDoc,
    userId: string,
): StudioRole | null {
    if (!userId || !studio.members?.length) return null;
    const m = studio.members.find((mem) => uid(mem.user) === userId);
    return m?.role ?? null;
}

export function canInviteToStudio(studio: IStudioDoc, userId: string): boolean {
    const r = getUserStudioRole(studio, userId);
    return r === StudioRole.OWNER || r === StudioRole.ADMIN;
}

/**
 * Resolve studio path param: Mongo id, then public code, then slug.
 */
export async function resolveStudioMongoId(param: string): Promise<string | null> {
    const trimmed = param?.trim();
    if (!trimmed) return null;

    const isMongoObjectId =
        mongoose.Types.ObjectId.isValid(trimmed) &&
        new mongoose.Types.ObjectId(trimmed).toString() === trimmed;

    if (isMongoObjectId) {
        const r = await studioRepository.findStudioById(trimmed, false);
        if (r.error || !r.data) return null;
        const doc = r.data as { _id?: unknown; id?: unknown };
        if (doc._id != null) return String(doc._id);
        if (doc.id != null) return String(doc.id);
        return '';
    }

    let r = await studioRepository.findByCode(trimmed);
    if (!r.error && r.data) {
        const doc = r.data as { _id?: unknown; id?: unknown };
        if (doc._id != null) return String(doc._id);
        if (doc.id != null) return String(doc.id);
        return '';
    }

    r = await studioRepository.findBySlug(trimmed);
    if (!r.error && r.data) {
        const doc = r.data as { _id?: unknown; id?: unknown };
        if (doc._id != null) return String(doc._id);
        if (doc.id != null) return String(doc.id);
        return '';
    }

    return null;
}

class StudioService {
    private async resolveStudioParam(param: string): Promise<string | null> {
        return resolveStudioMongoId(param);
    }

    private async resolveOwnersForCreate(
        actingUserId: string,
        dto: CreateStudioDTO,
        isPlatformAdmin: boolean,
    ): Promise<{
        ownerMinister?: mongoose.Types.ObjectId;
        ownerCreator?: mongoose.Types.ObjectId;
        error?: IResult;
    }> {
        let ownerMinister: mongoose.Types.ObjectId | undefined;
        let ownerCreator: mongoose.Types.ObjectId | undefined;

        if (dto.ownerMinisterId) {
            const m = await ministerRepository.findMinister(dto.ownerMinisterId);
            if (m.error || !m.data) {
                return {
                    error: {
                        error: true,
                        code: 404,
                        message: 'Minister not found',
                        data: {},
                    },
                };
            }
            const doc = m.data as { user?: unknown };
            const mid = uid(doc.user);
            if (!isPlatformAdmin && mid !== actingUserId) {
                return {
                    error: {
                        error: true,
                        code: 403,
                        message: 'You cannot assign a minister you do not own',
                        data: {},
                    },
                };
            }
            ownerMinister = new mongoose.Types.ObjectId(dto.ownerMinisterId);
        }

        if (dto.ownerCreatorId) {
            const c = await creatorRepository.findCreator(dto.ownerCreatorId);
            if (c.error || !c.data) {
                return {
                    error: {
                        error: true,
                        code: 404,
                        message: 'Creator not found',
                        data: {},
                    },
                };
            }
            const doc = c.data as { user?: unknown };
            const cid = uid(doc.user);
            if (!isPlatformAdmin && cid !== actingUserId) {
                return {
                    error: {
                        error: true,
                        code: 403,
                        message: 'You cannot assign a creator you do not own',
                        data: {},
                    },
                };
            }
            ownerCreator = new mongoose.Types.ObjectId(dto.ownerCreatorId);
        }

        if (!ownerMinister && !ownerCreator) {
            const userRes = await userRepository.findById(actingUserId);
            if (userRes.error || !userRes.data) {
                return {
                    error: {
                        error: true,
                        code: 400,
                        message: 'User not found',
                        data: {},
                    },
                };
            }
            const u = userRes.data as IUserDoc & { minister?: unknown };
            if (u.minister) {
                ownerMinister = new mongoose.Types.ObjectId(uid(u.minister));
            } else {
                const mr = await ministerRepository.findOne({
                    user: actingUserId,
                } as any);
                if (!mr.error && mr.data) {
                    ownerMinister = new mongoose.Types.ObjectId(
                        uid((mr.data as { _id: unknown })._id),
                    );
                } else {
                    const cr = await creatorRepository.findOne({
                        user: actingUserId,
                    } as any);
                    if (!cr.error && cr.data) {
                        ownerCreator = new mongoose.Types.ObjectId(
                            uid((cr.data as { _id: unknown })._id),
                        );
                    }
                }
            }
        }

        if (!ownerMinister && !ownerCreator) {
            return {
                error: {
                    error: true,
                    code: 400,
                    message:
                        'A minister or creator profile is required to create a studio',
                    data: {},
                },
            };
        }

        return { ownerMinister, ownerCreator };
    }

    private async generateUniqueCode(): Promise<string | null> {
        for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
            const raw = generateRandomChars(12).replace(/[^a-zA-Z0-9]/g, '');
            const code = (raw || generateRandomChars(12)).toUpperCase().slice(0, 12);
            const ex = await studioRepository.findByCode(code);
            if (ex.error || !ex.data) return code;
        }
        return null;
    }

    private async generateUniqueSlug(baseName: string): Promise<string | null> {
        let base = genSlug(baseName.trim()).toLowerCase() || genSlug(baseName);
        if (!base || STUDIO_RESERVED_SLUGS.has(base.toLowerCase())) {
            const fallbackRaw = generateRandomChars(12).replace(/[^a-zA-Z0-9]/g, '');
            base = `channel-${(fallbackRaw || generateRandomChars(12)).toUpperCase().slice(0, 12).toLowerCase()}`;
        }
        for (let i = 0; i < MAX_SLUG_ATTEMPTS; i++) {
            const candidate =
                i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
            if (STUDIO_RESERVED_SLUGS.has(candidate.toLowerCase())) continue;
            const ex = await studioRepository.findBySlug(candidate);
            if (ex.error || !ex.data) return candidate;
        }
        return null;
    }

    private async deriveStudioIdentity(
        actingUserId: string,
        owners: {
            ownerMinister?: mongoose.Types.ObjectId;
            ownerCreator?: mongoose.Types.ObjectId;
        },
        dto: CreateStudioDTO,
    ): Promise<{
        country: ICountry;
        avatar: string;
        email: string;
        profile: IStudioDoc['profile'];
    }> {
        const profile = emptyProfile();
        let country = emptyCountry();
        let avatar = dto.avatar ?? '';
        let email = (dto.email ?? '').trim();

        const userRes = await userRepository.findById(actingUserId);
        const userEmail = ((userRes.data as IUserDoc | undefined)?.email ?? '').trim();
        if (!email) email = userEmail;

        if (owners.ownerMinister) {
            const mr = await ministerRepository.findMinister(
                String(owners.ownerMinister),
            );
            if (!mr.error && mr.data) {
                const min = mr.data as Record<string, any>;
                if (min.country && typeof min.country === 'object') {
                    country = min.country as ICountry;
                }
                avatar = (dto.avatar ?? min.avatar ?? avatar) as string;
                email = (dto.email ?? min.email ?? email).trim();
                const mp = min.profile || {};
                const hq = mp.ministryHQLocation || {};
                profile.description =
                    (dto.description ?? mp.description ?? '') as string;
                profile.ministryName = (dto.branchName ??
                    mp.ministryName ??
                    '') as string;
                profile.ministryLogo = (dto.logo ?? mp.ministryLogo ?? '') as string;
                profile.banner = (dto.banner ?? mp.banner ?? profile.banner) as string;
                profile.ministryType = (mp.ministryType ?? '') as string;
                profile.ministryHQLocation = {
                    address: hq.address ?? '',
                    city: (dto.city ?? hq.city ?? '') as string,
                    state: hq.state ?? '',
                    country: hq.country ?? '',
                    postalCode: hq.postalCode ?? '',
                };
                profile.phoneNumber = (mp.phoneNumber ?? '') as string;
                profile.phoneCode = (mp.phoneCode ?? '') as string;
                profile.countryPhone = (mp.countryPhone ?? '') as string;
                profile.email = (mp.email ?? '') as string;
                profile.websiteUrl = (mp.websiteUrl ?? '') as string;
                profile.socials = Array.isArray(mp.socials) ? mp.socials : [];
                profile.languages = Array.isArray(mp.languages)
                    ? mp.languages
                    : [];
                profile.members = [owners.ownerMinister] as any;
                return { country, avatar, email, profile };
            }
        }

        if (owners.ownerCreator) {
            const cr = await creatorRepository.findCreator(
                String(owners.ownerCreator),
            );
            if (!cr.error && cr.data) {
                const c = cr.data as Record<string, any>;
                if (c.country && typeof c.country === 'object') {
                    country = c.country as ICountry;
                }
                avatar = (dto.avatar ?? c.avatar ?? avatar) as string;
                email = (dto.email ?? c.email ?? email).trim();
                const cp = c.profile || {};
                profile.description =
                    (dto.description ?? cp.description ?? '') as string;
                profile.ministryName = (dto.branchName ??
                    cp.displayName ??
                    dto.name ??
                    '') as string;
                profile.ministryLogo = (dto.logo ?? '') as string;
                profile.banner = (dto.banner ?? cp.banner ?? profile.banner) as string;
                profile.websiteUrl = (cp.websiteUrl ?? '') as string;
                profile.socials = Array.isArray(cp.socials) ? cp.socials : [];
                profile.languages = Array.isArray(cp.languages)
                    ? cp.languages
                    : [];
                profile.ministryHQLocation = {
                    ...profile.ministryHQLocation,
                    city: (dto.city ?? profile.ministryHQLocation.city) as string,
                };
                profile.members = [];
                return { country, avatar, email, profile };
            }
        }

        if (dto.description) profile.description = dto.description.trim();
        if (dto.branchName) profile.ministryName = dto.branchName.trim();
        if (dto.logo) profile.ministryLogo = dto.logo;
        if (dto.banner) profile.banner = dto.banner;
        if (dto.city) {
            profile.ministryHQLocation = {
                ...profile.ministryHQLocation,
                city: dto.city,
            };
        }
        if (typeof dto.country === 'string' && dto.country.trim()) {
            const code = dto.country.trim();
            country = { ...emptyCountry(), code2: code, name: code };
        }
        return { country, avatar, email, profile };
    }

    public async createStudio(
        actingUserId: string,
        dto: CreateStudioDTO,
        options: { isPlatformAdmin?: boolean } = {},
    ): Promise<IResult<CreateStudioResult>> {
        const result: IResult<CreateStudioResult> = {
            error: false,
            message: '',
            code: 200,
            data: {} as CreateStudioResult,
        };

        const owners = await this.resolveOwnersForCreate(
            actingUserId,
            dto,
            !!options.isPlatformAdmin,
        );
        if (owners.error) return owners.error as IResult<CreateStudioResult>;

        const code = await this.generateUniqueCode();
        if (!code) {
            result.error = true;
            result.code = 503;
            result.message = 'Could not allocate a unique studio code';
            return result;
        }

        let slug = dto.slug
            ? genSlug(dto.slug.trim()).toLowerCase()
            : await this.generateUniqueSlug(dto.name);
        if (!slug) {
            result.error = true;
            result.code = 503;
            result.message = 'Could not allocate a unique studio slug';
            return result;
        }
        if (STUDIO_RESERVED_SLUGS.has(slug.toLowerCase())) {
            result.error = true;
            result.code = 400;
            result.message = 'This slug is reserved';
            return result;
        }
        const slugTaken = await studioRepository.findBySlug(slug);
        if (!slugTaken.error && slugTaken.data) {
            result.error = true;
            result.code = 409;
            result.message = 'Slug already in use';
            return result;
        }

        const identity = await this.deriveStudioIdentity(actingUserId, owners, dto);

        const topicIds = (dto.topics ?? [])
            .filter(Boolean)
            .map((t) => new mongoose.Types.ObjectId(t));

        const payload: Partial<IStudioDoc> = {
            code,
            slug,
            name: dto.name.trim(),
            country: identity.country as any,
            avatar: identity.avatar,
            email: identity.email,
            profile: identity.profile as any,
            category: dto.category,
            isPublic: dto.isPublic ?? true,
            isVerified: false,
            tags: dto.tags ?? [],
            topics: topicIds as any,
            sermons: [],
            series: [],
            playlists: [],
            members: [
                {
                    user: new mongoose.Types.ObjectId(actingUserId) as any,
                    role: StudioRole.OWNER,
                    joinedAt: new Date(),
                    permissions: [],
                },
            ],
            invites: [],
            followers: 0,
            totalListeners: 0,
            monthlyListeners: 0,
            totalSermons: 0,
            totalSeries: 0,
            totalPlays: 0,
            status: StudioStatus.ACTIVE,
            createdBy: new mongoose.Types.ObjectId(actingUserId) as any,
        };

        const created = await studioRepository.createStudio(payload);
        if (created.error || !created.data) {
            result.error = true;
            result.code = created.code || 500;
            result.message = created.message;
            return result;
        }

        result.data = {
            studio: created.data as IStudioDoc,
            ownerMinisterId: owners.ownerMinister
                ? String(owners.ownerMinister)
                : undefined,
            ownerCreatorId: owners.ownerCreator
                ? String(owners.ownerCreator)
                : undefined,
        };
        result.message = 'Studio created successfully';
        return result;
    }

    public async linkStudioToProfiles(
        studioId: string,
        userId: string,
        ownerMinisterId?: string,
        ownerCreatorId?: string,
    ): Promise<void> {
        const sid = new mongoose.Types.ObjectId(studioId);
        const userPatch: Record<string, unknown> = { primaryStudio: sid };

        if (ownerMinisterId) {
            await ministerRepository.updateMinister(ownerMinisterId, {
                studio: sid,
            } as any);
            userPatch.minister = new mongoose.Types.ObjectId(ownerMinisterId);
            userPatch.isMinister = true;
        }
        if (ownerCreatorId) {
            await creatorRepository.updateCreator(ownerCreatorId, {
                studio: sid,
            } as any);
            userPatch.isCreator = true;
        }
        await userRepository.updateUser(userId, userPatch as any);
    }

    private defaultNameFromMinister(minister: Record<string, unknown>): string {
        const profile = (minister.profile as Record<string, unknown>) || {};
        const fromName = [minister.firstName, minister.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();
        return (
            fromName ||
            (profile.ministryName as string) ||
            (profile.ministerialName as string) ||
            (minister.email as string) ||
            'Studio'
        );
    }

    private defaultNameFromCreator(creator: Record<string, unknown>): string {
        const profile = (creator.profile as Record<string, unknown>) || {};
        const fromName = [creator.firstName, creator.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();
        return (
            (profile.displayName as string) ||
            fromName ||
            (creator.email as string) ||
            'Creator studio'
        );
    }

    /**
     * Idempotent: ensures one default MINISTRY studio for a minister at onboarding.
     */
    public async provisionDefaultStudioForMinister(
        ministerId: string,
        userId: string,
    ): Promise<IResult<ProvisionDefaultStudioResult>> {
        const fail = (
            code: number,
            message: string,
        ): IResult<ProvisionDefaultStudioResult> => ({
            error: true,
            code,
            message,
            data: { studio: null, created: false },
        });

        const mr = await ministerRepository.findMinister(ministerId);
        if (mr.error || !mr.data) {
            return fail(404, 'Minister not found');
        }
        const minister = mr.data as Record<string, unknown>;
        const existingStudioId = minister.studio ? uid(minister.studio) : '';
        if (existingStudioId) {
            const existing = await studioRepository.findStudioById(
                existingStudioId,
                false,
            );
            if (!existing.error && existing.data) {
                await this.linkStudioToProfiles(
                    existingStudioId,
                    userId,
                    ministerId,
                );
                return {
                    error: false,
                    code: 200,
                    message: 'Studio already linked',
                    data: {
                        studio: existing.data as IStudioDoc,
                        created: false,
                    },
                };
            }
        }

        const name = this.defaultNameFromMinister(minister);
        const created = await this.createStudio(
            userId,
            {
                name,
                category: StudioType.MINISTRY,
                ownerMinisterId: ministerId,
                isPublic: true,
            },
            { isPlatformAdmin: true },
        );
        if (created.error || !created.data?.studio) {
            return fail(
                created.code || 500,
                created.message || 'Failed to provision default studio',
            );
        }
        const studio = created.data.studio;
        const sid = String(studio._id);
        await this.linkStudioToProfiles(sid, userId, ministerId, undefined);
        return {
            error: false,
            code: 201,
            message: 'Default studio provisioned',
            data: { studio, created: true },
        };
    }

    /**
     * Idempotent: ensures one default PERSONAL studio for a creator at onboarding.
     */
    public async provisionDefaultStudioForCreator(
        creatorId: string,
        userId: string,
    ): Promise<IResult<ProvisionDefaultStudioResult>> {
        const fail = (
            code: number,
            message: string,
        ): IResult<ProvisionDefaultStudioResult> => ({
            error: true,
            code,
            message,
            data: { studio: null, created: false },
        });

        const cr = await creatorRepository.findCreator(creatorId);
        if (cr.error || !cr.data) {
            return fail(404, 'Creator not found');
        }
        const creator = cr.data as Record<string, unknown>;
        const existingStudioId = creator.studio ? uid(creator.studio) : '';
        if (existingStudioId) {
            const existing = await studioRepository.findStudioById(
                existingStudioId,
                false,
            );
            if (!existing.error && existing.data) {
                await this.linkStudioToProfiles(
                    existingStudioId,
                    userId,
                    undefined,
                    creatorId,
                );
                return {
                    error: false,
                    code: 200,
                    message: 'Studio already linked',
                    data: {
                        studio: existing.data as IStudioDoc,
                        created: false,
                    },
                };
            }
        }

        const name = this.defaultNameFromCreator(creator);
        const created = await this.createStudio(
            userId,
            {
                name,
                category: StudioType.PERSONAL,
                ownerCreatorId: creatorId,
                isPublic: true,
            },
            { isPlatformAdmin: true },
        );
        if (created.error || !created.data?.studio) {
            return fail(
                created.code || 500,
                created.message || 'Failed to provision default studio',
            );
        }
        const studio = created.data.studio;
        const sid = String(studio._id);
        await this.linkStudioToProfiles(sid, userId, undefined, creatorId);
        return {
            error: false,
            code: 201,
            message: 'Default studio provisioned',
            data: { studio, created: true },
        };
    }

    public async getStudioById(id: string): Promise<IResult<{ studio: IStudioDoc }>> {
        const studioMongoId = await this.resolveStudioParam(id);
        if (!studioMongoId) {
            return {
                error: true,
                code: 404,
                message: 'Studio not found',
                data: {} as { studio: IStudioDoc },
            };
        }
        const r = await studioRepository.findStudioById(studioMongoId, true);
        if (r.error || !r.data) {
            return {
                error: true,
                code: r.code || 404,
                message: r.message || 'Studio not found',
                data: {} as { studio: IStudioDoc },
            };
        }
        return {
            error: false,
            code: 200,
            message: 'OK',
            data: { studio: r.data as IStudioDoc },
        };
    }

    public async getMyPrimaryStudio(
        userId: string,
    ): Promise<IResult<{ studio: IStudioDoc | null; role: StudioRole | null }>> {
        const userRes = await userRepository.findById(userId);
        if (userRes.error || !userRes.data) {
            return {
                error: true,
                code: 404,
                message: 'User not found',
                data: { studio: null, role: null },
            };
        }
        const u = userRes.data as IUserDoc & {
            primaryStudio?: unknown;
            minister?: unknown;
        };
        const ps = u.primaryStudio ? uid(u.primaryStudio) : '';
        if (ps) {
            const s = await studioRepository.findStudioById(ps, true);
            if (!s.error && s.data) {
                const studio = s.data as IStudioDoc;
                return {
                    error: false,
                    code: 200,
                    message: 'OK',
                    data: {
                        studio,
                        role: getUserStudioRole(studio, userId),
                    },
                };
            }
        }

        const mRes = await ministerRepository.findOne({ user: userId } as any);
        if (!mRes.error && mRes.data) {
            const minister = mRes.data as { studio?: unknown };
            const sid = minister.studio ? uid(minister.studio) : '';
            if (sid) {
                const s = await studioRepository.findStudioById(sid, true);
                if (!s.error && s.data) {
                    const studio = s.data as IStudioDoc;
                    return {
                        error: false,
                        code: 200,
                        message: 'OK',
                        data: {
                            studio,
                            role: getUserStudioRole(studio, userId),
                        },
                    };
                }
            }
        }

        const cRes = await creatorRepository.findOne({ user: userId } as any);
        if (!cRes.error && cRes.data) {
            const creator = cRes.data as { studio?: unknown };
            const sid = creator.studio ? uid(creator.studio) : '';
            if (sid) {
                const s = await studioRepository.findStudioById(sid, true);
                if (!s.error && s.data) {
                    const studio = s.data as IStudioDoc;
                    return {
                        error: false,
                        code: 200,
                        message: 'OK',
                        data: {
                            studio,
                            role: getUserStudioRole(studio, userId),
                        },
                    };
                }
            }
        }

        return {
            error: false,
            code: 200,
            message: 'No studio',
            data: { studio: null, role: null },
        };
    }

    public async listMine(userId: string, page?: number): Promise<IResult> {
        return studioRepository.listForUser(userId, { page });
    }

    public async updateStudio(
        actingUserId: string,
        dto: UpdateStudioDTO,
    ): Promise<IResult<{ studio: IStudioDoc }>> {
        const studioMongoId = await this.resolveStudioParam(dto.studioId);
        if (!studioMongoId) {
            return {
                error: true,
                code: 404,
                message: 'Studio not found',
                data: {} as { studio: IStudioDoc },
            };
        }
        dto = { ...dto, studioId: studioMongoId };
        const found = await studioRepository.findStudioById(dto.studioId, false);
        if (found.error || !found.data) {
            return {
                error: true,
                code: 404,
                message: 'Studio not found',
                data: {} as { studio: IStudioDoc },
            };
        }
        const studio = found.data as IStudioDoc;
        const role = getUserStudioRole(studio, actingUserId);
        if (
            role !== StudioRole.OWNER &&
            role !== StudioRole.ADMIN &&
            role !== StudioRole.EDITOR
        ) {
            return {
                error: true,
                code: 403,
                message: 'Not allowed to update this studio',
                data: {} as { studio: IStudioDoc },
            };
        }

        const patch: Partial<IStudioDoc> = {};
        if (dto.name != null) patch.name = dto.name.trim();
        if (dto.isPublic != null) patch.isPublic = dto.isPublic;
        if (dto.avatar != null) patch.avatar = dto.avatar;
        if (dto.tags != null) patch.tags = dto.tags;
        if (dto.status != null) patch.status = dto.status;
        if (dto.category != null) patch.category = dto.category;

        const prevProfile =
            (studio as unknown as { profile?: IStudioDoc['profile'] }).profile ||
            emptyProfile();
        const mergedProfile: IStudioDoc['profile'] = {
            ...emptyProfile(),
            ...prevProfile,
            ministryHQLocation: {
                ...emptyProfile().ministryHQLocation,
                ...(prevProfile.ministryHQLocation || {}),
            },
        };
        let profileDirty = false;
        if (dto.description != null) {
            mergedProfile.description = dto.description;
            profileDirty = true;
        }
        if (dto.branchName != null) {
            mergedProfile.ministryName = dto.branchName;
            profileDirty = true;
        }
        if (dto.logo != null) {
            mergedProfile.ministryLogo = dto.logo;
            profileDirty = true;
        }
        if (dto.banner != null) {
            mergedProfile.banner = dto.banner;
            profileDirty = true;
        }
        if (dto.city != null) {
            mergedProfile.ministryHQLocation = {
                ...mergedProfile.ministryHQLocation,
                city: dto.city,
            };
            profileDirty = true;
        }
        if (profileDirty) {
            patch.profile = mergedProfile as any;
        }

        if (dto.country != null) {
            if (typeof dto.country === 'string' && dto.country.trim()) {
                const c = dto.country.trim();
                patch.country = {
                    ...emptyCountry(),
                    code2: c,
                    name: c,
                } as any;
            }
        }

        if (dto.topics != null) {
            patch.topics = dto.topics
                .filter(Boolean)
                .map((t) => new mongoose.Types.ObjectId(t)) as any;
        }

        if (dto.slug != null) {
            const s = genSlug(dto.slug.trim()).toLowerCase();
            if (STUDIO_RESERVED_SLUGS.has(s.toLowerCase())) {
                return {
                    error: true,
                    code: 400,
                    message: 'Reserved slug',
                    data: {} as { studio: IStudioDoc },
                };
            }
            const ex = await studioRepository.findBySlug(s);
            if (
                !ex.error &&
                ex.data &&
                uid((ex.data as IStudioDoc)._id) !== dto.studioId
            ) {
                return {
                    error: true,
                    code: 409,
                    message: 'Slug already in use',
                    data: {} as { studio: IStudioDoc },
                };
            }
            patch.slug = s;
        }

        const up = await studioRepository.updateStudio(dto.studioId, patch);
        if (up.error || !up.data) {
            return {
                error: true,
                code: up.code || 500,
                message: up.message,
                data: {} as { studio: IStudioDoc },
            };
        }
        const again = await studioRepository.findStudioById(dto.studioId, true);
        return {
            error: false,
            code: 200,
            message: 'Studio updated',
            data: { studio: (again.data || up.data) as IStudioDoc },
        };
    }

    public async createInvite(
        actingUserId: string,
        dto: CreateStudioInviteDTO,
    ): Promise<IResult<{ inviteId: string }>> {
        const studioMongoId = await this.resolveStudioParam(dto.studioId);
        if (!studioMongoId) {
            return {
                error: true,
                code: 404,
                message: 'Studio not found',
                data: {} as { inviteId: string },
            };
        }
        dto = { ...dto, studioId: studioMongoId };
        const found = await studioRepository.findStudioById(dto.studioId, false);
        if (found.error || !found.data) {
            return {
                error: true,
                code: 404,
                message: 'Studio not found',
                data: {} as { inviteId: string },
            };
        }
        const studio = found.data as IStudioDoc;
        if (!canInviteToStudio(studio, actingUserId)) {
            return {
                error: true,
                code: 403,
                message: 'Only owner or admin can invite',
                data: {} as { inviteId: string },
            };
        }
        if (dto.role === StudioRole.OWNER) {
            return {
                error: true,
                code: 400,
                message: 'Cannot invite as owner',
                data: {} as { inviteId: string },
            };
        }
        if (!dto.email && !dto.userId) {
            return {
                error: true,
                code: 400,
                message: 'email or userId required',
                data: {} as { inviteId: string },
            };
        }

        const emailNorm = dto.email?.trim().toLowerCase();
        const invites = [...(studio.invites || [])] as any[];
        const dup = invites.find(
            (i) =>
                (dto.userId && uid(i.user) === dto.userId) ||
                (emailNorm && i.email === emailNorm),
        );
        if (dup && dup._id) {
            return {
                error: false,
                code: 200,
                message: 'Invite already exists',
                data: { inviteId: String(dup._id) },
            };
        }

        const newInvite = {
            user: dto.userId
                ? new mongoose.Types.ObjectId(dto.userId)
                : undefined,
            email: emailNorm,
            role: dto.role,
            invitedBy: new mongoose.Types.ObjectId(actingUserId),
            invitedAt: new Date(),
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        };
        invites.push(newInvite);

        const up = await studioRepository.updateStudio(dto.studioId, {
            invites,
        } as any);
        if (up.error) {
            return {
                error: true,
                code: up.code || 500,
                message: up.message,
                data: {} as { inviteId: string },
            };
        }
        const refreshed = await studioRepository.findStudioById(dto.studioId, false);
        const st = refreshed.data as IStudioDoc;
        const last = (st.invites as any[])[(st.invites as any[]).length - 1];
        return {
            error: false,
            code: 201,
            message: 'Invite created',
            data: { inviteId: String(last._id) },
        };
    }

    public async cancelInvite(
        actingUserId: string,
        studioId: string,
        inviteId: string,
    ): Promise<IResult> {
        const studioMongoId = await this.resolveStudioParam(studioId);
        if (!studioMongoId) {
            return { error: true, code: 404, message: 'Studio not found', data: {} };
        }
        studioId = studioMongoId;
        const found = await studioRepository.findStudioById(studioId, false);
        if (found.error || !found.data) {
            return { error: true, code: 404, message: 'Studio not found', data: {} };
        }
        const studio = found.data as IStudioDoc;
        if (!canInviteToStudio(studio, actingUserId)) {
            return { error: true, code: 403, message: 'Forbidden', data: {} };
        }
        const invites = (studio.invites || []).filter(
            (i: any) => String(i._id) !== inviteId,
        );
        await studioRepository.updateStudio(studioId, { invites } as any);
        return { error: false, code: 200, message: 'Invite cancelled', data: {} };
    }

    public async acceptInvite(
        userId: string,
        studioId: string,
        inviteId: string,
    ): Promise<IResult<{ studio: IStudioDoc }>> {
        const studioMongoId = await this.resolveStudioParam(studioId);
        if (!studioMongoId) {
            return {
                error: true,
                code: 404,
                message: 'Studio not found',
                data: {} as { studio: IStudioDoc },
            };
        }
        studioId = studioMongoId;
        const found = await studioRepository.findStudioById(studioId, false);
        if (found.error || !found.data) {
            return {
                error: true,
                code: 404,
                message: 'Studio not found',
                data: {} as { studio: IStudioDoc },
            };
        }
        const studio = found.data as IStudioDoc;
        const inv = (studio.invites || []).find(
            (i: any) => String(i._id) === inviteId,
        ) as any;
        if (!inv) {
            return {
                error: false,
                code: 200,
                message: 'Already handled',
                data: { studio },
            };
        }
        if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
            return {
                error: true,
                code: 410,
                message: 'Invite expired',
                data: {} as { studio: IStudioDoc },
            };
        }
        const invUser = inv.user ? String(inv.user) : '';
        const invEmail = (inv.email as string) || '';
        const uRes = await userRepository.findById(userId);
        const email = (
            (uRes.data as IUserDoc | undefined)?.email || ''
        ).toLowerCase();
        const okUser = invUser && invUser === userId;
        const okEmail =
            invEmail && email && invEmail.toLowerCase() === email.toLowerCase();
        if (!okUser && !okEmail) {
            return {
                error: true,
                code: 403,
                message: 'This invite is not for you',
                data: {} as { studio: IStudioDoc },
            };
        }

        const members = [...(studio.members || [])] as any[];
        if (!members.some((m) => String(m.user) === userId)) {
            members.push({
                user: new mongoose.Types.ObjectId(userId),
                role: inv.role,
                joinedAt: new Date(),
                invitedBy: inv.invitedBy,
                permissions: [],
            });
        }
        const invites = (studio.invites || []).filter(
            (i: any) => String(i._id) !== inviteId,
        );
        await studioRepository.updateStudio(studioId, {
            members,
            invites,
        } as any);
        const again = await studioRepository.findStudioById(studioId, true);
        return {
            error: false,
            code: 200,
            message: 'Joined studio',
            data: { studio: again.data as IStudioDoc },
        };
    }

    public async rejectInvite(
        userId: string,
        studioId: string,
        inviteId: string,
    ): Promise<IResult> {
        const studioMongoId = await this.resolveStudioParam(studioId);
        if (!studioMongoId) {
            return { error: true, code: 404, message: 'Studio not found', data: {} };
        }
        studioId = studioMongoId;
        const found = await studioRepository.findStudioById(studioId, false);
        if (found.error || !found.data) {
            return { error: true, code: 404, message: 'Studio not found', data: {} };
        }
        const studio = found.data as IStudioDoc;
        const inv = (studio.invites || []).find(
            (i: any) => String(i._id) === inviteId,
        ) as any;
        if (!inv) {
            return { error: false, code: 200, message: 'OK', data: {} };
        }
        const invUser = inv.user ? String(inv.user) : '';
        const invEmail = (inv.email as string) || '';
        const uRes = await userRepository.findById(userId);
        const email = (
            (uRes.data as IUserDoc | undefined)?.email || ''
        ).toLowerCase();
        const ok =
            (invUser && invUser === userId) ||
            (invEmail && email && invEmail === email);
        if (!ok) {
            return { error: true, code: 403, message: 'Forbidden', data: {} };
        }
        const invites = (studio.invites || []).filter(
            (i: any) => String(i._id) !== inviteId,
        );
        await studioRepository.updateStudio(studioId, { invites } as any);
        return { error: false, code: 200, message: 'Rejected', data: {} };
    }
}

export default new StudioService();
