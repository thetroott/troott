import { ENVType } from '@/types/common.enum';
import { IRedisOptions } from '@/interfaces/common.interface';

let config: IRedisOptions;

switch (process.env.APP_ENV) {
    case ENVType.PRODUCTION:
        config = {
            host: process.env.REDIS_HOST_PROD!,
            port: Number(process.env.REDIS_PORT),
            user: process.env.REDIS_USER!,
            password: process.env.REDIS_PASSWORD_PROD!,
            managed: process.env.REDIS_CONFIG === 'true',
            db: Number(process.env.REDIS_DB!),
            tls: {
                rejectUnauthorized:
                    (process.env.REDIS_TLS_REJECT_UNAUTHORIZED as string) ===
                    'true',
            },
        };
        break;

    case ENVType.STAGING:
        config = {
            host: process.env.REDIS_HOST_STAGING!,
            port: Number(process.env.REDIS_PORT),
            user: process.env.REDIS_USER!,
            password: process.env.REDIS_PASSWORD_STAGING!,
            db: Number(process.env.REDIS_DB!),
            managed: process.env.REDIS_CONFIG === 'true',
            tls: {
                rejectUnauthorized:
                    (process.env.REDIS_TLS_REJECT_UNAUTHORIZED as string) ===
                    'true',
            },
        };
        break;

    case ENVType.DEVELOPMENT:
        config = {
            host: process.env.REDIS_HOST_DEV!,
            port: Number(process.env.REDIS_PORT),
            user: process.env.REDIS_USER!,
            password: process.env.REDIS_PASSWORD_DEV!,
            db: Number(process.env.REDIS_DB!),
            managed: false,
            tls: {
                rejectUnauthorized:
                    (process.env.REDIS_TLS_REJECT_UNAUTHORIZED as string) ===
                    'false',
            },
        };
        break;

    default:
        throw new Error('Invalid APP_ENV. Redis config not set.');
}

export const REDIS_CONFIG = config;
