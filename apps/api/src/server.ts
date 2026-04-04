import app from "./config/app.config";
import colors from "colors";
import connectDB from "./config/db.config";
import seedData from "./config/seeds/seeder.seed";
import redisHandler from "./middlewares/redis.mdw";
import { REDIS_CONFIG } from "./config/redis.config";
import startWorkers from "./tasks/workers/worker";


const PORT = process.env.PORT as string;

const connect = async (): Promise<void> => {

  await connectDB();
  await seedData();

  await redisHandler.connect(REDIS_CONFIG);
  await startWorkers()

};

connect();

const server = app.listen(PORT, () => {
  console.log(
    colors.bold.yellow(`troott server running in ${process.env.NODE_ENV} mode`)
  );
});

process.on("unhandledRejection", (err: any, promise) => {
  console.log(colors.bold.red(`Error: ${err.message}`));
  server.close(() => process.exit(1));
});

process.on("SIGINT", async () => {
  await redisHandler.disconnect(); 
  server.close(() => process.exit(0));
});
