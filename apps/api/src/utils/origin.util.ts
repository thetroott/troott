const normalizeOrigin = (origin: string): string => {
    return origin.trim().replace(/\/+$/, '');
};

const buildOrigins = (): Set<string> => {
    const entries = [
        process.env.CLIENT_APP_URL,
        process.env.CLIENT_STAGING_URL,
        process.env.CLIENT_STAGING_BASE_URL,
        process.env.CLIENT_LOCAL_URL,
        process.env.CORS_ALLOWED_ORIGINS,
    ]
        .filter(Boolean)
        .flatMap((value) => String(value).split(','))
        .map((value) => normalizeOrigin(value))
        .filter(Boolean);

    return new Set(entries);
};

let origins: Set<string> | null = null;

const getOrigins = (origin: string): boolean => {
    if (!origin) {
        return true;
    }

    const normalized = normalizeOrigin(origin);

    if (!origins) {
        origins = buildOrigins();
    }

    return origins.has(normalized);
};

export { getOrigins, buildOrigins };
