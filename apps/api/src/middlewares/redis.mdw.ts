import { ClientClosedError, RedisClientType, createClient } from 'redis';
import { IData, IRedisOptions } from '@/interfaces/common.interface';
import { REDIS_CONFIG } from '../configs/redis.config';
import colors from 'colors';
import { ENVType } from '@/types/common.enum';

function isLocalRedisHost(host: string): boolean {
    const normalized = host.trim().toLowerCase();
    return (
        normalized === '127.0.0.1' ||
        normalized === 'localhost' ||
        normalized === '::1'
    );
}

class redisHandler {
    public client: RedisClientType | null = null;
    private connecting: Promise<void> | null = null;

    public async connect(options: IRedisOptions = REDIS_CONFIG) {
        if (this.client?.isOpen) {
            return;
        }

        if (this.connecting) {
            await this.connecting;
            return;
        }

        this.connecting = this.openClient(options);
        try {
            await this.connecting;
        } finally {
            this.connecting = null;
        }
    }

    private async openClient(options: IRedisOptions) {
        const useManagedTls =
            options.managed && !isLocalRedisHost(options.host);

        if (useManagedTls) {
            this.client = createClient({
                socket: {
                    host: options.host,
                    port: options.port,
                    connectTimeout: 30000,
                    tls: true,
                    rejectUnauthorized: options.tls.rejectUnauthorized,
                    minVersion: 'TLSv1.2',
                },
                database: options.db,
                username: options.user || undefined,
                password: options.password || undefined,
            });
        } else {
            // Local dev and non-TLS Redis — align with Bull queue socket settings.
            this.client = createClient({
                socket: {
                    host: options.host,
                    port: options.port,
                    connectTimeout: 30000,
                },
                database: options.db ?? 0,
                ...(options.user ? { username: options.user } : {}),
                ...(options.password ? { password: options.password } : {}),
            });
        }

        if (process.env.APP_ENV === ENVType.DEVELOPMENT) {
            this.client.on('connect', () => {
                console.log(colors.green.bold('Redis: Connection established'));
            });

            this.client.on('reconnecting', () => {
                console.log(colors.yellow.bold('Redis: Reconnecting...'));
            });

            this.client.on('close', () => {
                console.log(colors.yellow.bold('Redis: Connection closed'));
            });

            this.client.on('error', (err: Error) => {
                console.error(colors.red.bold('Redis Error:'), err.message);
            });
        }

        await this.client.connect();
        console.log(colors.green.inverse('Connected to REDIS'));
    }

    private async ensureReady(): Promise<boolean> {
        if (!this.client) {
            return false;
        }
        if (this.client.isOpen) {
            return true;
        }
        try {
            await this.connect();
            return this.client?.isOpen ?? false;
        } catch (err) {
            console.error(
                colors.red.bold('Redis: reconnect failed'),
                err instanceof Error ? err.message : err,
            );
            return false;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client?.isOpen) {
            await this.client.quit();
            console.log(colors.yellow.bold('REDIS: Connection disconnected'));
        }
        this.client = null;
    }

    public async keepData(data: IData, exp: number) {
        if (!(await this.ensureReady()) || !this.client) {
            return;
        }
        try {
            const value = JSON.stringify(data.value);
            return await this.client.set(data.key, value, { EX: exp });
        } catch (err) {
            if (err instanceof ClientClosedError) {
                return;
            }
            throw err;
        }
    }

    public async fetchData<T = unknown>(key: string): Promise<T | null> {
        if (!(await this.ensureReady()) || !this.client) {
            return null;
        }
        try {
            const data = await this.client.get(key);
            return data ? (JSON.parse(data) as T) : null;
        } catch (err) {
            if (err instanceof ClientClosedError) {
                return null;
            }
            throw err;
        }
    }

    public async deleteData(key: string) {
        if (!(await this.ensureReady()) || !this.client) {
            return;
        }
        try {
            await this.client.del(key);
        } catch (err) {
            if (err instanceof ClientClosedError) {
                return;
            }
            throw err;
        }
    }

    public async exists(key: string): Promise<boolean> {
        if (!(await this.ensureReady()) || !this.client) {
            return false;
        }
        try {
            const exists = await this.client.exists(key);
            return exists === 1;
        } catch (err) {
            if (err instanceof ClientClosedError) {
                return false;
            }
            throw err;
        }
    }

    public async paginate(data: unknown[], page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return data.slice(start, end);
    }
}

export default new redisHandler();
