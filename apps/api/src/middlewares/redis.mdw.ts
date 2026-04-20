import { RedisClientType } from 'redis';
import { IData, IRedisOptions } from '@/modules/shared/interfaces/interfaces.util';
import { createClient } from 'redis';
import { REDIS_CONFIG } from '../configs/redis.config';
import colors from 'colors';
import { ENVType } from '../utils/enums.util';

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
                    tls: true,
                    rejectUnauthorized: REDIS_CONFIG.tls.rejectUnauthorized,
                    minVersion: 'TLSv1.2',
                },
                database: REDIS_CONFIG.db,
                username: REDIS_CONFIG.user,
                password: REDIS_CONFIG.password,
            });
        } else {
            this.client = createClient({
                url: `rediss://${REDIS_CONFIG.user}:${REDIS_CONFIG.password}@${REDIS_CONFIG.host}:${REDIS_CONFIG.port}/${REDIS_CONFIG.db}`,
            });
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

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            console.log(colors.yellow.bold('REDIS: Connection disconnected'));
        }
    }

    public async keepData(data: IData, exp: number) {
        const value = JSON.stringify(data.value);
        return await this.client!.set(data.key, value, { EX: exp });
    }

    public async fetchData<T = any>(key: string): Promise<T | null> {
        const data = await this.client!.get(key);
        return data ? JSON.parse(data) : null;
    }

    public async deleteData(key: string) {
        await this.client!.del(key);
    }

    public async exists(key: string): Promise<boolean> {
        const exists = await this.client!.exists(key);
        return exists === 1;
    }

    public async paginate(data: any[], page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return data.slice(start, end);
    }
}

export default new redisHandler();
