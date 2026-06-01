import { troottAPIClient } from '@/api/config';
import cookieService from '@/api/services/cookies';
import type { EditUserDTO } from '@/dtos/user.dto';
import type { UpdateMinisterDTO } from '@/dtos/minister.dto';
import type { UpdateCreatorDTO } from '@/dtos/creator.dto';
import { UserType } from '@/models/User.model';
import { normalizeUserType } from '@/utils/auth-redirect.util';
import {
    PATH_GET_STARTED,
    PATH_SEG_GET_STARTED_VERIFY_DOC_UPLOAD,
} from '@/routes/paths';
import {
    readAddressDraft,
    readHydratedPersonalCountry,
    readMinistryDraft,
    readPersonalDraft,
} from '@/services/get-started-draft-storage';
import { ONBOARDING_STEP_DOCUMENT } from '@/utils/hub-onboarding.util';
import { readServerOnboardingStep } from '@/hooks/app/useDocumentVerification';

const DOCUMENT_UPLOAD_PATH = `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOC_UPLOAD}`;

function countryPayload(
    c?: { code2: string; name: string; phoneCode?: string; flag?: string },
): EditUserDTO['country'] | undefined {
    if (!c?.code2) return undefined;
    return {
        code2: c.code2,
        name: c.name,
        phoneCode: c.phoneCode,
        flag: c.flag,
    } as EditUserDTO['country'];
}

function isCreatorPersona(): boolean {
    const ut = normalizeUserType(cookieService.getUserType() || '');
    return ut === UserType.CREATOR.toLowerCase();
}

/**
 * Persist get-started screen data and/or advance studio onboarding milestones
 * before client-side navigation on Continue.
 */
export async function runGetStartedCheckpoint(
    fromPath: string,
): Promise<{ ok: boolean; message?: string }> {
    const api = troottAPIClient();
    const creatorFlow = isCreatorPersona();

    if (fromPath === `${PATH_GET_STARTED}/verify-account`) {
        const country =
            readPersonalDraft()?.country ?? readHydratedPersonalCountry();
        if (!country?.code2) {
            return {
                ok: false,
                message:
                    'Select your country of residence before continuing.',
            };
        }
        return { ok: true };
    }

    if (fromPath === '/get-started/verify-account/personal-information') {
        const d = readPersonalDraft();
        if (!d?.country?.code2) {
            return {
                ok: false,
                message: 'Select your country of residence before continuing.',
            };
        }
        if (!d?.dateOfBirth) {
            return {
                ok: false,
                message: 'Select your full date of birth before continuing.',
            };
        }
        const userBody: EditUserDTO = {};
        const c = countryPayload(d?.country);
        if (c) userBody.country = c;
        if (d?.dateOfBirth) {
            const t = Date.parse(d.dateOfBirth);
            if (!Number.isNaN(t)) userBody.dateOfBirth = new Date(t);
        }

        if (Object.keys(userBody).length > 0) {
            const ur = await api.user.updateProfile(userBody);
            if (ur.error) return { ok: false, message: ur.message };
        }

        if (creatorFlow) {
            const creatorBody: UpdateCreatorDTO = {};
            if (c) creatorBody.country = c as UpdateCreatorDTO['country'];
            if (d?.dateOfBirth) {
                const t = Date.parse(d.dateOfBirth);
                if (!Number.isNaN(t)) creatorBody.dateOfBirth = new Date(t);
            }
            if (Object.keys(creatorBody).length > 0) {
                const cr = await api.creator.updateCreator(creatorBody);
                if (cr.error) return { ok: false, message: cr.message };
            }
            const pr = await api.creator.onboardingPersonalComplete({});
            if (pr.error) return { ok: false, message: pr.message };
            return { ok: true };
        }

        const ministerBody: UpdateMinisterDTO = {};
        if (c) ministerBody.country = c as UpdateMinisterDTO['country'];
        if (d?.dateOfBirth) {
            const t = Date.parse(d.dateOfBirth);
            if (!Number.isNaN(t)) ministerBody.dateOfBirth = new Date(t);
        }
        if (Object.keys(ministerBody).length > 0) {
            const mr = await api.minister.updateMinister(ministerBody);
            if (mr.error) return { ok: false, message: mr.message };
        }
        const pr = await api.minister.onboardingPersonalComplete({});
        if (pr.error) return { ok: false, message: pr.message };
        return { ok: true };
    }

    /** feat-0015: document completion is modal-only — footer may exit to hub if already done. */
    if (fromPath === DOCUMENT_UPLOAD_PATH) {
        const serverStep = await readServerOnboardingStep();
        if (serverStep >= ONBOARDING_STEP_DOCUMENT) {
            return { ok: true };
        }
        return {
            ok: false,
            message:
                'Submit your documents in the upload dialog before continuing.',
        };
    }

    if (
        fromPath === '/get-started/home-address' ||
        fromPath === '/get-started/complete-profile'
    ) {
        const d = readAddressDraft();
        if (
            !d?.address?.trim() ||
            !d?.city?.trim() ||
            !d?.phoneNumber?.trim()
        ) {
            return {
                ok: false,
                message:
                    'Enter your street address, city, and phone number before continuing.',
            };
        }
        const userBody: EditUserDTO = {};
        if (d) {
            userBody.location = {
                address: d.address ?? '',
                city: d.city ?? '',
                state: d.state ?? '',
                country: d.country ?? '',
                postalCode: d.postalCode ?? '',
            };
            if (d.phoneNumber?.trim()) {
                userBody.phoneNumber = d.phoneNumber.trim();
            }
            if (d.phoneCode?.trim()) {
                userBody.phoneCode = d.phoneCode.trim();
            }
        }
        if (Object.keys(userBody).length > 0) {
            const ur = await api.user.updateProfile(userBody);
            if (ur.error) return { ok: false, message: ur.message };
        }
        const ar = creatorFlow
            ? await api.creator.onboardingAddressComplete({})
            : await api.minister.onboardingAddressComplete({});
        if (ar.error) return { ok: false, message: ar.message };
        return { ok: true };
    }

    if (fromPath === '/get-started/ministry-input') {
        const d = readMinistryDraft();
        if (!d?.ministryName?.trim()) {
            return {
                ok: false,
                message: 'Enter your ministry name before continuing.',
            };
        }

        if (creatorFlow) {
            const creatorBody: UpdateCreatorDTO = {
                profile: {
                    displayName: d.ministryName.trim(),
                },
            };
            if (d.websiteUrl.trim()) {
                creatorBody.profile!.websiteUrl = d.websiteUrl.trim();
            }
            if (d.description.trim()) {
                creatorBody.profile!.description = d.description.trim();
            }
            const cr = await api.creator.updateCreator(creatorBody);
            if (cr.error) return { ok: false, message: cr.message };
            const pr = await api.creator.onboardingMinistryComplete({});
            if (pr.error) return { ok: false, message: pr.message };
            return { ok: true };
        }

        const ministerBody: UpdateMinisterDTO = {};
        if (d) {
            ministerBody.profile = {};
            if (d.ministryName.trim())
                ministerBody.profile.ministryName = d.ministryName.trim();
            if (d.websiteUrl.trim())
                ministerBody.profile.websiteUrl = d.websiteUrl.trim();
            if (d.description.trim())
                ministerBody.profile.description = d.description.trim();
            if (d.hqLine.trim()) {
                ministerBody.profile.ministryHQLocation = {
                    address: d.hqLine.trim(),
                    city: '',
                    state: '',
                };
            }
        }
        if (
            ministerBody.profile &&
            Object.keys(ministerBody.profile).length > 0
        ) {
            const mr = await api.minister.updateMinister(ministerBody);
            if (mr.error) return { ok: false, message: mr.message };
        }
        const pr = await api.minister.onboardingMinistryComplete({});
        if (pr.error) return { ok: false, message: pr.message };
        return { ok: true };
    }

    if (fromPath === '/get-started/tour-guide') {
        const tr = creatorFlow
            ? await api.creator.onboardingTourComplete({})
            : await api.minister.onboardingTourComplete({});
        if (tr.error) return { ok: false, message: tr.message };
        return { ok: true };
    }

    return { ok: true };
}
