import type { ICountry } from '@/utils/interfaces.util';
import {
    GET_STARTED_VERIFY_ACCOUNT_COUNTRY_KEY,
    clearGetStartedLocalStorage,
} from '@/utils/get-started-local-storage.util';

const PREFIX = 'troott.getStarted.draft.';

export { clearGetStartedLocalStorage };

export const GET_STARTED_DRAFT_KEYS = {
    personal: `${PREFIX}personal`,
    address: `${PREFIX}address`,
    ministry: `${PREFIX}ministry`,
} as const;

export type PersonalDraft = {
    country?: Pick<ICountry, 'code2' | 'name' | 'phoneCode' | 'flag'>;
    dateOfBirth?: string;
};

export type AddressDraft = {
    address: string;
    postalCode: string;
    city: string;
    state: string;
    country: string;
    phoneNumber: string;
    phoneCode: string;
};

export type MinistryDraft = {
    ministryName: string;
    websiteUrl: string;
    hqLine: string;
    description: string;
};

function readJSON<T>(key: string): T | null {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function writeJSON(key: string, value: unknown): void {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore quota */
    }
}

export function readPersonalDraft(): PersonalDraft | null {
    return readJSON<PersonalDraft>(GET_STARTED_DRAFT_KEYS.personal);
}

export function writePersonalDraft(d: PersonalDraft): void {
    writeJSON(GET_STARTED_DRAFT_KEYS.personal, d);
}

function readLocalJSON<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function writeLocalJSON(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore quota */
    }
}

export function readVerifyAccountCountry(): PersonalDraft['country'] | null {
    return readLocalJSON<PersonalDraft['country']>(
        GET_STARTED_VERIFY_ACCOUNT_COUNTRY_KEY,
    );
}

export function writeVerifyAccountCountry(
    country: NonNullable<PersonalDraft['country']>,
): void {
    writeLocalJSON(GET_STARTED_VERIFY_ACCOUNT_COUNTRY_KEY, country);
}

export function clearVerifyAccountCountry(): void {
    try {
        localStorage.removeItem(GET_STARTED_VERIFY_ACCOUNT_COUNTRY_KEY);
    } catch {
        /* ignore */
    }
}

/** Merge residence into session draft + localStorage mirror (verify intro + personal). */
export function persistPersonalCountry(
    country: Pick<ICountry, 'code2' | 'name' | 'phoneCode' | 'flag'>,
): void {
    const slice = {
        code2: country.code2,
        name: country.name,
        phoneCode: country.phoneCode,
        flag: country.flag,
    };
    const prev = readPersonalDraft() ?? {};
    writePersonalDraft({ ...prev, country: slice });
    writeVerifyAccountCountry(slice);
}

export function readHydratedPersonalCountry(): PersonalDraft['country'] | undefined {
    return (
        readPersonalDraft()?.country ??
        readVerifyAccountCountry() ??
        undefined
    );
}

export function readAddressDraft(): AddressDraft | null {
    return readJSON<AddressDraft>(GET_STARTED_DRAFT_KEYS.address);
}

export function writeAddressDraft(d: AddressDraft): void {
    writeJSON(GET_STARTED_DRAFT_KEYS.address, d);
}

export function readMinistryDraft(): MinistryDraft | null {
    return readJSON<MinistryDraft>(GET_STARTED_DRAFT_KEYS.ministry);
}

export function writeMinistryDraft(d: MinistryDraft): void {
    writeJSON(GET_STARTED_DRAFT_KEYS.ministry, d);
}

function removeKey(key: string): void {
    try {
        sessionStorage.removeItem(key);
    } catch {
        /* ignore */
    }
}

export function clearPersonalDraft(): void {
    removeKey(GET_STARTED_DRAFT_KEYS.personal);
}

export function clearAddressDraft(): void {
    removeKey(GET_STARTED_DRAFT_KEYS.address);
}

export function clearMinistryDraft(): void {
    removeKey(GET_STARTED_DRAFT_KEYS.ministry);
}

/** UC-SE34: drop client draft after Continue checkpoint so server data wins on remount. */
export function clearDraftForCheckpointPath(fromPath: string): void {
    if (fromPath.endsWith('/personal-information')) {
        clearPersonalDraft();
        clearVerifyAccountCountry();
        return;
    }
    if (
        fromPath === '/get-started/home-address' ||
        fromPath === '/get-started/complete-profile'
    ) {
        clearAddressDraft();
        return;
    }
    if (fromPath === '/get-started/ministry-input') {
        clearMinistryDraft();
    }
}
