import { Random } from "@btffamily/pacitude";
import { AddJobDTO, AddJobsDTO } from "../../dtos/queue.dto";
import BullQueue from "../../queues/queue";
import logger from "../../utils/logger.util";
import { JobOptions } from "bull";



/**
    * @name addJob
    * @param queue 
    * @param job
    */

const addJob = (payload: AddJobDTO) => {

    const { queueName, jobName, data, options } = payload;

    // Determine the Job ID: use provided ID or generate a new one
    const generatedJobId = Random.randomCode(6, true).toUpperCase();
    const jobOptions = options ? options : {
        attempts: 5,
        delay: 3000,
        jobId: generatedJobId
    };
    
    // Get the final jobId that will be used
    const jobId = jobOptions.jobId || generatedJobId;

    BullQueue.addJobs({
        queueName: queueName,
        jobs: [
            {
                name: jobName,
                data: data,
                options: jobOptions
            }
        ]
    })

    

    logger.log({
        data: `Successfully added job ${jobId} to ${queueName}`,
        label: "background-job",
        type: "success",
    });

}


/**
    * @name addJobs
    * @param queue 
    * @param jobs 
    */
const addJobs = async (payload: AddJobsDTO): Promise<void> => {
    
    const { queueName, jobs } = payload;
    
    // Array to collect IDs for the final log summary
    const addedJobIds: (string | number)[] = []; 
    const numberOfJobs = jobs.length;

    const queue = await BullQueue.createQueue({ name: queueName });

    for (const job of jobs) {
        
        // 1. Generate and ensure jobId is available
        const jobId = job.options?.jobId || Random.randomCode(6, true).toUpperCase();
        
        // 2. Add the job and await confirmation
        await queue.add(job.name, job.data, {
            attempts: 5,
            jobId,
            ...job.options,
        } as JobOptions);

        // --- Individual Log (Traceability) ---
        logger.log({
            data: `Successfully added job ${jobId} to ${queueName}`,
            label: "background-job-item",
            type: "info",
        });

        // 3. Collect the ID for the final summary log
        addedJobIds.push(jobId);
    }
    
    // --- Summary Log (Confirmation) ---
    if (numberOfJobs > 0) { // Only log a summary if jobs were actually added
        const idList = addedJobIds.join(', ');
        const logData = `BATCH SUMMARY: Successfully submitted ${numberOfJobs} jobs to queue '${queueName}'. IDs: ${idList}`;

        logger.log({
            data: logData,
            label: "background-job-batch", // Use a specific label for the batch
            type: "success", // Use 'success' for confirmation that the batch submitted
        });
    }
};

export {
    addJob,
    addJobs
}
