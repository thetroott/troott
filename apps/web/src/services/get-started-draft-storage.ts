import type { ICountry } from '@/utils/interfaces.util';

const PREFIX = 'troott.getStarted.draft.';

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
