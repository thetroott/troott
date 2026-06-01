import {
    APIKeyEnvironment,
    APIKeyStatus,
} from '@/interfaces/common.interface';

/** Nested state subdocument for {@link ICountry}. */
export const stateSubSchema = {
    code: { type: String },
    name: { type: String },
    subdivision: { type: String },
};

/** Nested timezone subdocument for {@link ICountry}. */
export const timezoneSubSchema = {
    code: { type: String },
    name: { type: String },
    subdivision: { type: String },
    label: { type: String },
    displayName: { type: String },
    countries: [{ type: String }],
    utcOffset: { type: String },
    utcOffsetStr: { type: String },
    dstOffset: { type: String },
    dstOffsetStr: { type: String },
    aliasOf: { type: String },
};

/** Country subdocument matching {@link ICountry}. */
export const countrySubSchema = {
    name: { type: String },
    code2: { type: String },
    code3: { type: String },
    capital: { type: String },
    region: { type: String },
    subregion: { type: String },
    states: [stateSubSchema],
    slug: { type: String },
    timezones: [timezoneSubSchema],
    flag: { type: String },
    base64: { type: String },
    currencyCode: { type: String },
    currencyImage: { type: String },
    phoneCode: { type: String },
};

/** API key subdocument matching {@link IAPIKey}. */
export const apiKeySubSchema = {
    secret: { type: String, select: false },
    public: { type: String },
    token: { type: String, select: false },
    publicToken: { type: String },
    domain: { type: String },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: String },
    createdAt: { type: Date },
    lastUsed: { type: Date },
    environment: {
        type: String,
        enum: Object.values(APIKeyEnvironment),
    },
    status: {
        type: String,
        enum: Object.values(APIKeyStatus),
    },
};

/** Debit card subdocument (subscription + transaction). */
export const debitCardSubSchema = {
    authCode: { type: String, select: false },
    cardBin: { type: String },
    cardLast: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    cardPan: { type: String, select: false },
    token: { type: String, select: false },
    provider: { type: String },
};
