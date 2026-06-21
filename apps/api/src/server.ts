import app from './configs/app.config';
import colors from 'colors';
import connectDB from './configs/db.config';
import redisHandler from './middlewares/redis.mdw';
import { REDIS_CONFIG } from './configs/redis.config';
import startWorkers from './tasks/workers/worker';
import seedData from './configs/seeds/seeder.seed';
import startScheduler, { shutdownScheduler } from './tasks/scheduler/scheduler';

const PORT = process.env.APP_PORT as string;

const startServer = async (): Promise<void> => {
    // Connect to Database
    await connectDB();

    // Seed Data
    await seedData();

    //Connect to Redis
    await redisHandler.connect(REDIS_CONFIG);

    // Start Workers
    await startWorkers();

    // Start Scheduler (Bull + Cron)
    await startScheduler();
};

startServer();

const server = app.listen(PORT, () => {
    console.log(
        colors.bold.yellow(
            `Troott server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
        ),
    );
});

process.on('unhandledRejection', (err: unknown) => {
    const message =
        err instanceof Error ? err.message : String(err ?? 'Unknown error');
    console.log(colors.bold.red(`Unhandled rejection: ${message}`));
    if (process.env.NODE_ENV === 'production') {
        server.close(() => process.exit(1));
    }
});

process.on('SIGINT', async () => {
    console.log(colors.yellow('Server shutting down...'));
    await shutdownScheduler();
    await redisHandler.disconnect();
    server.close(() => process.exit(0));
});
