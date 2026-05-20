import app from './configs/app.config';
import colors from 'colors';
import connectDB from './configs/db.config';
import seedData from './configs/seeds/seeder.seed';
import redisHandler from './middlewares/redis.mdw';
import { REDIS_CONFIG } from './configs/redis.config';
import startWorkers from './tasks/workers/worker';
import startScheduler, { shutdownScheduler } from './tasks/scheduler/scheduler';

const PORT = process.env.PORT as string;

const connect = async (): Promise<void> => {
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

connect();

const server = app.listen(PORT, () => {
    console.log(
        colors.bold.yellow(
            `troott server running in ${process.env.NODE_ENV} mode`,
        ),
    );
});

process.on('unhandledRejection', (err: any, promise) => {
    console.log(colors.bold.red(`Error: ${err.message}`));
    server.close(() => process.exit(1));
});

process.on('SIGINT', async () => {
    console.log(colors.yellow('Server shutting down...'));
    await shutdownScheduler();
    //await redisHandler.disconnect();
    server.close(() => process.exit(0));
});
