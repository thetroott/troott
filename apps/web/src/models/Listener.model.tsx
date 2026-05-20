import type { ICountry } from '@/utils/interfaces.util';
import type { Upload } from '@/dtos/common-fields';

export interface ListenerOnboarding {
    step: number;
    status: string;
}

export interface Listener {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    slug: string;
    gender?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    country?: ICountry;
    homeCountry?: ICountry;
    avatar?: Upload;
    banner?: Upload;
    onboarding?: ListenerOnboarding;
    topics?: string[];
    ministers?: string[];
    ministry?: string;
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

/** Legacy LMS group shape (not Troott API) — kept for unused hooks. */
export interface ITalentGroup {
    [key: string]: unknown;
}

export default Listener;
