// import { enumToArray } from "@btffamily/pacitude";
// import Bull from "bull";

// import { createBullBoard } from '@bull-board/api'
// import { BullAdapter } from '@bull-board/api/bullAdapter'
// import { ExpressAdapter } from '@bull-board/express'
// import { QueueOptions } from "bullmq";


// const queueOptions: QueueOptions = {
//   redis: {
//     tls: {},                // enables TLS (secure Redis connection)
//     connectTimeout: 80000,  // timeout for Redis connection
//     host: REDIS_HOST,
//     password: REDIS_PASS,
//     username: REDIS_USER,
//     port: parseInt(REDIS_PORT)
//   },
// };

// enum QueueChannels {
//   EMAIL = "email-queue",
//   VIDEO = "video-queue"
// }


// const queuesList = enumToArray(QueueChnannels, 'values-only');


// const queues = queuesList
//   .map((qs) => new Bull(qs, queueOptions))   // create Bull queue for each name
//   .map((q) => new BullAdapter(q));           // wrap it for Bull Board


// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath("/jobs/ui");

// createBullBoard({
//   queues, 
//   serverAdapter: serverAdapter, 
// });
