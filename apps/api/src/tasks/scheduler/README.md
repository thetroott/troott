# Scheduler System

This directory contains the scheduler system implementation using Bull and node-cron for scheduling recurring jobs.

## Architecture

The scheduler system consists of:

1. **Bull Queue Manager** (`../../queues/queue.ts`)
    - Manages Bull queues and workers
    - Handles Redis connections
    - Provides queue and worker lifecycle management
    - Uses the existing Bull implementation

2. **Scheduler Service** (`scheduler.service.ts`)
    - Manages cron-based job scheduling
    - Validates cron patterns
    - Adds jobs to Bull queues based on cron schedules

3. **Cron Patterns Utility** (`cron.patterns.ts`)
    - Pre-defined reusable cron patterns
    - Helper functions to build custom patterns
    - Clear documentation of cron format structure
    - Day of week and month constants

4. **Scheduled Job Definitions**
    - `reminder.ts` - Reminder-related scheduled jobs
    - `tmp-cleanup.ts` - Cleanup-related scheduled jobs

5. **Job Processors** (`jobs/`)
    - `reminder.job.ts` - Processes reminder jobs (uses Bull Job and DoneCallback pattern)
    - `cleanup.job.ts` - Processes cleanup jobs (uses Bull Job and DoneCallback pattern)

6. **Workers** (`scheduler.worker.ts`)
    - Creates and manages workers for scheduled job queues using `BullQueue.addProcessor`
    - Follows the same pattern as existing workers (e.g., `email.worker.ts`)

7. **Initialization** (`scheduler.init.ts`)
    - Starts the entire scheduler system
    - Handles graceful shutdown
    - Integrates with existing Bull queue system

## Usage

### Adding a New Scheduled Job

1. **Define the job configuration** in the appropriate file (e.g., `reminder.ts`):

```typescript
import { CronPatterns, CronPatternBuilder } from './cron.patterns';

// Using pre-defined patterns
const myJob: ScheduledJobConfig = {
    name: 'my-scheduled-job',
    cronPattern: CronPatterns.DAILY_MIDNIGHT, // Every day at midnight
    queueName: QueueChannel.MyQueue,
    jobName: JobChannel.MyJob,
    data: {
        // Your job data
    },
    options: {
        attempts: 3,
    },
    enabled: true,
};

// Or using the builder for custom patterns
const customJob: ScheduledJobConfig = {
    name: 'custom-job',
    cronPattern: CronPatternBuilder.dailyAt(14, 30), // Daily at 2:30 PM
    queueName: QueueChannel.MyQueue,
    jobName: JobChannel.MyJob,
    data: {},
    enabled: true,
};
```

2. **Add it to the initialization function**:

```typescript
export const startMyJobs = (): void => {
    schedulerService.scheduleJobs([myJob]);
};
```

3. **Register it in `scheduler.config.ts`**:

```typescript
export const startScheduledJobs = (): void => {
    startReminderJobs();
    startCleanupJobs();
    startMyJobs(); // Add this
};
```

4. **Create a job processor** in `jobs/my-job.job.ts`:

```typescript
export const processMyJob = async (job: Job): Promise<void> => {
    // Your job processing logic
};
```

5. **Register the worker** in `scheduler.worker.ts`:

```typescript
const myWorkerConfig: CreateWorkerDTO = {
    queueName: QueueChannel.MyQueue,
    jobName: JobChannel.MyJob,
    concurrency: 5,
};

await BullQueue.addProcessor(myWorkerConfig, processMyJob as any);
```

## Cron Pattern Format

Cron pattern format: `"* * * * *"`

```
 | | | | |
 | | | | └─── day of week (0-7, where 0 and 7 are Sunday)
 | | | └───── month (1-12)
 | | └─────── day of month (1-31)
 | └───────── hour (0-23)
 └─────────── minute (0-59)
```

Special characters:

- `*` = any value
- `,` = value list separator (e.g., `0,6` for Sunday and Saturday)
- `-` = range of values (e.g., `1-5` for Monday to Friday)
- `/` = step values (e.g., `*/5` for every 5 minutes)

## Using Cron Patterns

### Pre-defined Patterns

Import and use pre-defined patterns from `cron.patterns.ts`:

```typescript
import { CronPatterns } from './cron.patterns';

const job: ScheduledJobConfig = {
    cronPattern: CronPatterns.DAILY_9AM, // Every day at 9:00 AM
    // or
    cronPattern: CronPatterns.WEEKLY_MONDAY, // Every Monday at midnight
    // or
    cronPattern: CronPatterns.EVERY_HOUR, // Every hour
    // etc.
};
```

### Available Pre-defined Patterns

**Time-based:**

- `EVERY_MINUTE`, `EVERY_5_MINUTES`, `EVERY_10_MINUTES`, `EVERY_15_MINUTES`, `EVERY_30_MINUTES`
- `EVERY_HOUR`, `EVERY_6_HOURS`, `EVERY_12_HOURS`

**Daily:**

- `DAILY_MIDNIGHT`, `DAILY_1AM`, `DAILY_2AM`, `DAILY_6AM`, `DAILY_8AM`, `DAILY_9AM`
- `DAILY_NOON`, `DAILY_6PM`, `DAILY_9PM`, `DAILY_11PM`

**Weekly:**

- `WEEKLY_SUNDAY`, `WEEKLY_MONDAY`, `WEEKLY_MONDAY_8AM`, `WEEKLY_TUESDAY`, etc.

**Monthly:**

- `MONTHLY_1ST`, `MONTHLY_15TH`, `MONTHLY_LAST_DAY`

**Other:**

- `WEEKDAYS_9AM`, `WEEKDAYS_5PM`, `WEEKENDS_10AM`, `YEARLY_JAN_1ST`

### Building Custom Patterns

Use `CronPatternBuilder` for custom patterns:

```typescript
import { CronPatternBuilder, DayOfWeek } from './cron.patterns';

// Daily at 2:30 PM
CronPatternBuilder.dailyAt(14, 30); // "30 14 * * *"

// Every 15 minutes
CronPatternBuilder.everyNMinutes(15); // "*/15 * * * *"

// Every 4 hours
CronPatternBuilder.everyNHours(4); // "0 */4 * * *"

// Weekly on Friday at 5 PM
CronPatternBuilder.weeklyOn(DayOfWeek.FRIDAY, 17, 0); // "0 17 * * 5"

// Monthly on the 15th at midnight
CronPatternBuilder.monthlyOn(15); // "0 0 15 * *"

// Weekdays at 9 AM
CronPatternBuilder.weekdaysAt(9); // "0 9 * * 1-5"

// Custom pattern
CronPatternBuilder.atTime(30, 14, '*', '*', '1-5'); // "30 14 * * 1-5"
```

### Direct Pattern Examples

You can also use patterns directly:

- `'0 0 * * *'` - Every day at midnight
- `'0 9 * * *'` - Every day at 9:00 AM
- `'0 0 * * 1'` - Every Monday at midnight
- `'0 */6 * * *'` - Every 6 hours
- `'*/30 * * * *'` - Every 30 minutes
- `'0 0 1 * *'` - First day of every month at midnight
- `'0 9 * * 1-5'` - Weekdays at 9 AM
- `'0 10 * * 0,6'` - Weekends at 10 AM

## Configuration

Scheduled jobs can be configured with:

- `name`: Unique identifier for the job
- `cronPattern`: Cron expression for scheduling
- `queueName`: Bull queue name (use `QueueChannel` enum)
- `jobName`: Job name within the queue (use `JobChannel` enum)
- `data`: Job payload
- `options`: Bull job options (attempts, backoff, removeOnComplete, etc.)
- `timezone`: Optional timezone (e.g., 'America/New_York')
- `enabled`: Enable/disable the job (default: true)

## Monitoring

The scheduler logs all activities:

- Job scheduling
- Job execution
- Job completion/failure
- Worker lifecycle events

Check logs with label `'Scheduler'`, `'scheduler-worker'`, or `'scheduler-init'` for scheduler-related events.
