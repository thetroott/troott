import app from './configs/app.config';
import colors from 'colors';
import connectDB from './configs/db.config';
import seedData from './configs/seeds/seeder.seed';
import redisHandler from './middlewares/redis.mdw';
import { REDIS_CONFIG } from './configs/redis.config';
import startWorkers, { shutdownWorkers } from './tasks/workers/worker';
import startScheduler, { shutdownScheduler } from './tasks/scheduler/scheduler';
import type { Server } from 'http';

const PORT = process.env.PORT as string;

const connect = async (): Promise<void> => {
    await connectDB();
    await seedData();
    await redisHandler.connect(REDIS_CONFIG);
    await startWorkers();
    await startScheduler();
};

let server: Server;
let shuttingDown = false;

const gracefulShutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    console.log(colors.yellow(`${signal}: shutting down gracefully...`));

    try {
        await shutdownWorkers();
        await shutdownScheduler();
    } catch (err: any) {
        console.log(colors.bold.red(`Shutdown error: ${err?.message}`));
    }

    server.close(() => {
        console.log(colors.yellow('HTTP server closed'));
        process.exit(0);
    });

    setTimeout(() => {
        console.log(colors.bold.red('Forced shutdown after timeout'));
        process.exit(1);
    }, Number(process.env.GRACEFUL_SHUTDOWN_MS) || 120_000);
};

const start = async (): Promise<void> => {
    await connect();

    server = app.listen(PORT, () => {
        console.log(
            colors.bold.yellow(
                `troott server running in ${process.env.NODE_ENV} mode`,
            ),
        );
    });
};

start().catch((err: any) => {
    console.log(colors.bold.red(`Startup failed: ${err?.message ?? err}`));
    process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
    console.log(colors.bold.red(`Error: ${err.message}`));
    server?.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT');
});
