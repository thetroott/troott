import { RedisClientType } from 'redis';
import { IData, IRedisOptions } from '@/interfaces/common.interface';
import { createClient } from 'redis';
import { REDIS_CONFIG } from '../configs/redis.config';
import colors from 'colors';
import { ENVType } from '@/types/common.enum';

class redisHandler {
    public client: RedisClientType | null = null;
    private connectionAttempts = 0;

    public async connect(options: IRedisOptions) {
        if (options.managed) {
            this.client = createClient({
                socket: {
                    host: REDIS_CONFIG.host,
                    port: REDIS_CONFIG.port,
                    connectTimeout: 30000,
               //     tls: true,
                    rejectUnauthorized: REDIS_CONFIG.tls.rejectUnauthorized,
                    minVersion: 'TLSv1.2',
                },
                database: REDIS_CONFIG.db,
                username: REDIS_CONFIG.user,
                password: REDIS_CONFIG.password,
            });

            await this.client.connect();
            
        } else {
            this.client = createClient({
                socket: {
                    host: REDIS_CONFIG.host,
                    port: REDIS_CONFIG.port,
                },
                database: REDIS_CONFIG.db,
                ...(REDIS_CONFIG.user ? { username: REDIS_CONFIG.user } : {}),
                ...(REDIS_CONFIG.password
                    ? { password: REDIS_CONFIG.password }
                    : {}),
            });

            await this.client.connect();
        }

        if (process.env.APP_ENV === ENVType.DEVELOPMENT) {
            this.client.on('connect', () => {
                console.log(colors.green.bold('Redis: Connection established'));
                this.connectionAttempts = 0;
            });

            this.client.on('reconnecting', () => {
                console.log(colors.yellow.bold('Redis: Reconnecting...'));
            });

            this.client.on('close', () => {
                console.log(colors.yellow.bold('Redis: Connection closed'));
            });

            this.client.on('error', (err: any) => {
                console.error(colors.red.bold('Redis Error:'), err);
                if (err.message?.includes('ETIMEDOUT')) {
                    console.error(
                        colors.yellow.bold(
                            'Redis: Connection timeout - check network connectivity',
                        ),
                    );
                }
            });
        }

        console.log(colors.yellow.inverse('Connected to REDIS'));
    }

    private isReady(): boolean {
        return Boolean(this.client?.isOpen);
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            console.log(colors.yellow.bold('REDIS: Connection disconnected'));
        }
    }

    public async keepData(data: IData, exp: number) {
        if (!this.isReady()) {
            return null;
        }
        try {
            const value = JSON.stringify(data.value);
            return await this.client!.set(data.key, value, { EX: exp });
        } catch {
            return null;
        }
    }

    public async fetchData<T = any>(key: string): Promise<T | null> {
        if (!this.isReady()) {
            return null;
        }
        try {
            const data = await this.client!.get(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    public async deleteData(key: string) {
        if (!this.isReady()) {
            return null;
        }
        try {
            await this.client!.del(key);
        } catch {
            return null;
        }
    }

    public async exists(key: string): Promise<boolean> {
        if (!this.isReady()) {
            return false;
        }
        try {
            const exists = await this.client!.exists(key);
            return exists === 1;
        } catch {
            return false;
        }
    }

    public async paginate(data: any[], page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return data.slice(start, end);
    }
}

export default new redisHandler();
