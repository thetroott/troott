import { Types } from 'mongoose';
import User from '../../users/user/user.model';
import type { IUserDoc } from '../../users/user/user.interface';
import { userIsStaff } from '../../users/user/user.staff.util';
import { IResult } from '../../../utils/interfaces.util';
import { preferenceRepository } from './preference.repository';
import type { IUserPreferencesDoc } from './preference.interface';
import { mergePreferencePatch } from './preference.merge';
import preferenceMapper from './preference.mapper';
import {
    applyPreferenceStateToDoc,
    docToPreferenceState,
    isMongoDuplicateKeyError,
    legacyMinisterToObjectIds,
    preferencePatchHasKeys,
} from './preference.util';
import type {
    CreatePreferencesDTO,
    PreferencePatchDTO,
} from './preference.dto';

const forbidden: IResult = {
    error: true,
    code: 403,
    message: 'Forbidden',
    data: {},
};

class PreferenceService {
    private async assertSelfOrStaff(
        actorId: string,
        targetUserId: string,
    ): Promise<{ ok: true } | { ok: false; err: IResult }> {
        if (actorId === targetUserId) {
            return { ok: true };
        }
        if (await userIsStaff(actorId)) {
            return { ok: true };
        }
        return { ok: false, err: forbidden };
    }

    private async assertStaff(
        actorId: string,
    ): Promise<{ ok: true } | { ok: false; err: IResult }> {
        if (await userIsStaff(actorId)) {
            return { ok: true };
        }
        return { ok: false, err: forbidden };
    }

    /**
     * Ensure a UserPreferences row exists, lazy-migrating from legacy User.preferences
     * and notificationPreferences when needed.
     */
    public async ensureMigrated(
        userId: string,
    ): Promise<IUserPreferencesDoc | null> {
        if (!Types.ObjectId.isValid(userId)) {
            return null;
        }

        let doc = await preferenceRepository.findByUserId(userId);
        if (doc) {
            return doc;
        }

        const user = await User.findById(userId).select(
            'preferences notificationPreferences',
        );
        if (!user) {
            return null;
        }

        const legacy = user.preferences as
            | { topics?: string[]; minister?: unknown[] }
            | undefined;
        const topics = Array.isArray(legacy?.topics) ? legacy!.topics : [];
        const favoriteMinisters = legacyMinisterToObjectIds(legacy?.minister);

        const np = (user as IUserDoc & { notificationPreferences?: unknown })
            .notificationPreferences as
            | { email?: boolean; push?: boolean; sms?: boolean }
            | undefined;

        const defaults = preferenceRepository.defaultSections();
        const payload = {
            user: new Types.ObjectId(userId),
            taste: {
                favoriteTopics: topics,
                favoriteMinisters,
            },
            notifications: {
                email: np?.email ?? defaults.notifications.email,
                push: np?.push ?? defaults.notifications.push,
                sms: np?.sms ?? defaults.notifications.sms,
            },
            playback: defaults.playback,
            downloads: defaults.downloads,
            privacy: defaults.privacy,
            schemaVersion: defaults.schemaVersion,
        };

        try {
            doc = await preferenceRepository.create(payload);
        } catch (err: unknown) {
            if (isMongoDuplicateKeyError(err)) {
                doc = await preferenceRepository.findByUserId(userId);
            } else {
                throw err;
            }
        }

        if (!doc) {
            return null;
        }

        await User.updateOne(
            { _id: new Types.ObjectId(userId) },
            { $unset: { preferences: 1, notificationPreferences: 1 } },
        ).exec();

        return doc;
    }

    public async getByUser(
        actorId: string,
        targetUserId: string,
    ): Promise<IResult> {
        const gate = await this.assertSelfOrStaff(actorId, targetUserId);
        if (!gate.ok) {
            return gate.err;
        }
        const doc = await this.ensureMigrated(targetUserId);
        if (!doc) {
            return {
                error: true,
                code: 404,
                message: 'User not found',
                data: {},
            };
        }
        return {
            error: false,
            code: 200,
            message: 'Preferences fetched successfully',
            data: preferenceMapper.toResponse(doc),
        };
    }

    public async getAll(actorId: string): Promise<IResult> {
        const gate = await this.assertStaff(actorId);
        if (!gate.ok) {
            return gate.err;
        }
        const rows = await preferenceRepository.findAll();
        return {
            error: false,
            code: 200,
            message: 'All user preferences fetched successfully',
            data: rows.map((r) => preferenceMapper.toResponse(r)),
        };
    }

    public async patchByUser(
        actorId: string,
        targetUserId: string,
        patch: PreferencePatchDTO,
        options?: { allowEmpty?: boolean },
    ): Promise<IResult> {
        const gate = await this.assertSelfOrStaff(actorId, targetUserId);
        if (!gate.ok) {
            return gate.err;
        }
        if (!options?.allowEmpty && !preferencePatchHasKeys(patch)) {
            return {
                error: true,
                code: 400,
                message: 'No preference fields to update',
                data: {},
            };
        }
        const doc = await this.ensureMigrated(targetUserId);
        if (!doc) {
            return {
                error: true,
                code: 404,
                message: 'User not found',
                data: {},
            };
        }
        const merged = mergePreferencePatch(docToPreferenceState(doc), patch);
        applyPreferenceStateToDoc(doc, merged);
        await preferenceRepository.save(doc);
        return {
            error: false,
            code: 200,
            message: 'Preferences updated successfully',
            data: preferenceMapper.toResponse(doc),
        };
    }

    /**
     * First-run taste (favorite topics + ministers). Shared by onboarding and settings.
     */
    public async upsertTaste(
        actorId: string,
        targetUserId: string,
        payload: { favoriteTopics?: string[]; favoriteMinisters?: string[] },
    ): Promise<IResult> {
        return this.patchByUser(actorId, targetUserId, {
            taste: {
                favoriteTopics: payload.favoriteTopics,
                favoriteMinisters: payload.favoriteMinisters,
            },
        });
    }

    public async createInitial(
        actorId: string,
        body: CreatePreferencesDTO,
    ): Promise<IResult> {
        const target = body.user;
        if (!Types.ObjectId.isValid(target)) {
            return {
                error: true,
                code: 400,
                message: 'Invalid user id',
                data: {},
            };
        }
        const patch: PreferencePatchDTO = {};
        if (body.preferences) {
            if (body.preferences.topics !== undefined) {
                patch.topics = body.preferences.topics;
            }
            if (body.preferences.minister !== undefined) {
                patch.minister = body.preferences.minister;
            }
        }
        return this.patchByUser(actorId, target, patch, {
            allowEmpty: !preferencePatchHasKeys(patch),
        });
    }

    public async clearByUser(
        actorId: string,
        targetUserId: string,
    ): Promise<IResult> {
        const gate = await this.assertSelfOrStaff(actorId, targetUserId);
        if (!gate.ok) {
            return gate.err;
        }
        const doc = await this.ensureMigrated(targetUserId);
        if (!doc) {
            return {
                error: true,
                code: 404,
                message: 'User not found',
                data: {},
            };
        }
        const defaults = preferenceRepository.defaultSections();
        applyPreferenceStateToDoc(doc, {
            taste: defaults.taste,
            notifications: defaults.notifications,
            playback: defaults.playback,
            downloads: defaults.downloads,
            privacy: defaults.privacy,
        });
        await preferenceRepository.save(doc);
        return {
            error: false,
            code: 200,
            message: 'Preferences cleared',
            data: preferenceMapper.toResponse(doc),
        };
    }
}

const preferenceService = new PreferenceService();
export default preferenceService;
