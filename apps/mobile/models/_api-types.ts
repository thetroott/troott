/**
 * Shapes mirrored from `apps/api/src/interfaces/common.interface.ts`
 * and related API interfaces for client-side typing (JSON from the API).
 */
export interface ApiUpload {
    fileName: string;
    s3Key: string;
}

/** Country record (mobile + API-friendly). */
export interface ICountry {
    name: string;
    code2: string;
    code3: string;
    capital: string;
    region: string;
    subregion: string;
    currencyCode: string;
    currencyImage: string;
    phoneCode: string;
    flag: string;
    className?: string;
}

export interface IAPIKey {
    secret: string;
    public: string;
    token: string;
    publicToken: string;
    domain: string;
    isActive: boolean;
    updatedAt: string;
}

export interface IUserPermission {
    entity: string;
    actions: Array<string>;
}

/** Tokenised debit card (aligned with API subscription / listener shapes). */
export interface IDebitCard {
    authCode: string;
    cardBin: string;
    cardLast: string;
    expiryMonth: string;
    expiryYear: string;
    cardPan: string;
}
