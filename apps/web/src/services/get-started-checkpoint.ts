import { troottAPIClient } from '@/api/config';
import type { EditUserDTO } from '@/dtos/user.dto';
import type { UpdateMinisterDTO } from '@/dtos/minister.dto';
import {
    readAddressDraft,
    readMinistryDraft,
    readPersonalDraft,
} from '@/services/get-started-draft-storage';

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

/**
 * Persist get-started screen data and/or advance minister onboarding milestones
 * before client-side navigation on Continue.
 */
export async function runGetStartedCheckpoint(
    fromPath: string,
): Promise<{ ok: boolean; message?: string }> {
    const api = troottAPIClient();

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
        const ministerBody: UpdateMinisterDTO = {};
        if (c) ministerBody.country = c as UpdateMinisterDTO['country'];
        if (d?.dateOfBirth) {
            const t = Date.parse(d.dateOfBirth);
            if (!Number.isNaN(t)) ministerBody.dateOfBirth = new Date(t);
        }

        if (Object.keys(userBody).length > 0) {
            const ur = await api.user.updateProfile(userBody);
            if (ur.error) return { ok: false, message: ur.message };
        }
        if (Object.keys(ministerBody).length > 0) {
            const mr = await api.minister.updateMinister(ministerBody);
            if (mr.error) return { ok: false, message: mr.message };
        }
        const pr = await api.minister.onboardingPersonalComplete({});
        if (pr.error) return { ok: false, message: pr.message };
        return { ok: true };
    }

    if (fromPath === '/get-started/verify-account/verify-document/upload') {
        const dr = await api.minister.onboardingDocumentComplete({});
        if (dr.error) return { ok: false, message: dr.message };
        return { ok: true };
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
        const ar = await api.minister.onboardingAddressComplete({});
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
        const tr = await api.minister.onboardingTourComplete({});
        if (tr.error) return { ok: false, message: tr.message };
        return { ok: true };
    }

    return { ok: true };
}
