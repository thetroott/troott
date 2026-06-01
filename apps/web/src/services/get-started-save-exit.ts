import {
    PATH_GET_STARTED,
    studioHomePath,
} from '@/routes/paths';
import { getStoredStudioCode } from '@/utils/studio-nav.util';
import { isStudioOnboardingComplete } from '@/utils/portal-onboarding.util';
import type { MinisterResponseDTO } from '@/dtos/minister.dto';
import type { CreatorResponseDTO } from '@/dtos/creator.dto';
import {
    readAddressDraft,
    readMinistryDraft,
    readPersonalDraft,
    readHydratedPersonalCountry,
    writeAddressDraft,
    writeMinistryDraft,
    writePersonalDraft,
    persistPersonalCountry,
} from '@/services/get-started-draft-storage';

export const GET_STARTED_SAVE_EXIT_SUCCESS_TOAST =
    'Progress saved. You can continue later from Get Started.';

export const GET_STARTED_SAVE_EXIT_NO_DRAFT_TOAST =
    'You can return from Get Started. This step does not store partial progress locally.';

const PATH_VERIFY_INTRO = `${PATH_GET_STARTED}/verify-account`;
const PATH_PERSONAL = `${PATH_GET_STARTED}/verify-account/personal-information`;
const PATH_HOME_ADDRESS = `${PATH_GET_STARTED}/home-address`;
const PATH_COMPLETE_PROFILE = `${PATH_GET_STARTED}/complete-profile`;
const PATH_MINISTRY = `${PATH_GET_STARTED}/ministry-input`;

export function hasDraftSupport(pathname: string): boolean {
    return (
        pathname === PATH_VERIFY_INTRO ||
        pathname === PATH_PERSONAL ||
        pathname === PATH_HOME_ADDRESS ||
        pathname === PATH_COMPLETE_PROFILE ||
        pathname === PATH_MINISTRY
    );
}

/**
 * Flush latest session draft for the current step (forms auto-persist; this re-writes
 * so Save & Exit always runs after the last keystroke effect).
 */
export function flushDraftForPath(pathname: string): {
    saved: boolean;
    storageOk: boolean;
} {
    try {
        if (pathname === PATH_VERIFY_INTRO) {
            const hydrated = readHydratedPersonalCountry();
            if (hydrated?.code2) {
                persistPersonalCountry({
                    code2: hydrated.code2,
                    name: hydrated.name,
                    phoneCode: hydrated.phoneCode,
                    flag: hydrated.flag,
                });
            }
            return {
                saved: Boolean(hydrated?.code2),
                storageOk: true,
            };
        }
        if (pathname === PATH_PERSONAL) {
            const d = readPersonalDraft();
            if (d) writePersonalDraft(d);
            return {
                saved: Boolean(d?.country?.code2),
                storageOk: true,
            };
        }
        if (
            pathname === PATH_HOME_ADDRESS ||
            pathname === PATH_COMPLETE_PROFILE
        ) {
            const d = readAddressDraft();
            if (d) writeAddressDraft(d);
            const saved = Boolean(
                d?.address?.trim() ||
                    d?.city?.trim() ||
                    d?.phoneNumber?.trim() ||
                    d?.postalCode?.trim(),
            );
            return { saved, storageOk: true };
        }
        if (pathname === PATH_MINISTRY) {
            const d = readMinistryDraft();
            if (d) writeMinistryDraft(d);
            return {
                saved: Boolean(d?.ministryName?.trim()),
                storageOk: true,
            };
        }
        return { saved: false, storageOk: true };
    } catch {
        return { saved: false, storageOk: false };
    }
}

export function resolveGetStartedExitPath(
    userType: string,
    minister: MinisterResponseDTO | null | undefined,
    user: { onboard?: { status?: string } } | null | undefined,
    creator?: CreatorResponseDTO | null | undefined,
): string {
    if (
        isStudioOnboardingComplete(userType, minister, user ?? null, creator)
    ) {
        const code = getStoredStudioCode();
        if (code) return studioHomePath(code);
    }
    return PATH_GET_STARTED;
}
