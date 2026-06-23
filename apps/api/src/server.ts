import app from './configs/app.config';
import colors from 'colors';
import connectDB from './configs/db.config';
import redisHandler from './middlewares/redis.mdw';
import { REDIS_CONFIG } from './configs/redis.config';
import startWorkers from './tasks/workers/worker';
import seedData from './configs/seeds/seeder.seed';
import startScheduler, { shutdownScheduler } from './tasks/scheduler/scheduler';

const PORT = process.env.APP_PORT as string;

let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
    await connectDB();
    await seedData();
    await redisHandler.connect(REDIS_CONFIG);
    await startWorkers();
    await startScheduler();

    await new Promise<void>((resolve, reject) => {
        server = app.listen(PORT, () => {
            console.log(
                colors.bold.yellow(
                    `Troott server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
                ),
            );
            resolve();
        });

        server?.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                reject(
                    new Error(
                        `Port ${PORT} is already in use. Stop the other API process and retry.`,
                    ),
                );
                return;
            }

            reject(error);
        });
    });
};

startServer().catch(async (err: unknown) => {
    const message =
        err instanceof Error ? err.message : String(err ?? 'Unknown error');
    console.log(colors.bold.red(`Failed to start server: ${message}`));
    await shutdownScheduler();
    await redisHandler.disconnect();
    process.exit(1);
});

process.on('unhandledRejection', (err: unknown) => {
    const message =
        err instanceof Error ? err.message : String(err ?? 'Unknown error');
    console.log(colors.bold.red(`Unhandled rejection: ${message}`));
    if (process.env.NODE_ENV === 'production') {
        void shutdown().finally(() => process.exit(1));
    }
});

async function shutdown(): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(colors.yellow('Server shutting down...'));
    await shutdownScheduler();
    await redisHandler.disconnect();

    await new Promise<void>((resolve) => {
        if (!server) {
            resolve();
            return;
        }
        server.close(() => resolve());
    });
}

process.on('SIGINT', () => {
    void shutdown().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0));
});
