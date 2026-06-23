import { RedisClientType, createClient } from 'redis';
import colors from 'colors';

import type { IData, IRedisOptions } from '@/interfaces/common.interface';
import { REDIS_CONFIG } from '../configs/redis.config';

function isLocalRedisHost(host: string): boolean {
    const normalised = host.trim().toLowerCase();
    return (
        normalised === '127.0.0.1' ||
        normalised === 'localhost' ||
        normalised === '::1'
    );
}

function createRedisClient(options: IRedisOptions): RedisClientType {
    const useTls = options.managed && !isLocalRedisHost(options.host);

    if (useTls) {
        return createClient({
            socket: {
                host: options.host,
                port: options.port,
                connectTimeout: 30_000,
                tls: true,
                rejectUnauthorized: options.tls.rejectUnauthorized,
                minVersion: 'TLSv1.2',
            },
            database: options.db,
            username: options.user || undefined,
            password: options.password || undefined,
        });
    }

    return createClient({
        socket: {
            host: options.host,
            port: options.port,
            connectTimeout: 30_000,
        },
        database: options.db,
        username: options.user || undefined,
        password: options.password || undefined,
    });
}

class redisHandler {
    public client: RedisClientType | null = null;

    public async connect(options: IRedisOptions = REDIS_CONFIG): Promise<void> {
        if (this.client?.isOpen) {
            return;
        }

        this.client = createRedisClient(options);

        this.client.on('error', (error) => {
            console.log(
                colors.bold.red(
                    `REDIS error: ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                ),
            );
        });

        await this.client.connect();
        console.log(colors.yellow.inverse('Connected to REDIS'));
    }

    public async disconnect(): Promise<void> {
        if (!this.client?.isOpen) {
            this.client = null;
            return;
        }

        try {
            await this.client.quit();
            console.log(colors.yellow.bold('REDIS: Connection disconnected'));
        } catch {
            // Client may already be closed during shutdown.
        } finally {
            this.client = null;
        }
    }

    public async keepData(data: IData, exp: number) {
        if (!this.client?.isOpen) return;
        const value = JSON.stringify(data.value);
        return await this.client.set(data.key, value, { EX: exp });
    }

    public async fetchData<T = unknown>(key: string): Promise<T | null> {
        if (!this.client?.isOpen) return null;
        const data = await this.client.get(key);
        return data ? (JSON.parse(data) as T) : null;
    }

    public async deleteData(key: string) {
        if (!this.client?.isOpen) return;
        await this.client.del(key);
    }

    public async exists(key: string): Promise<boolean> {
        if (!this.client?.isOpen) return false;
        const exists = await this.client.exists(key);
        return exists === 1;
    }

    public async paginate(data: unknown[], page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return data.slice(start, end);
    }
}

export default new redisHandler();
