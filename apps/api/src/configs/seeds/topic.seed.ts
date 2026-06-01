import fs from 'fs';
import path from 'path';
import { Random } from '@btffamily/pacitude';
import Topic from '@/models/core/topic.model';
import User from '@/models/user.model';
import { UserType } from '@/interfaces/user.interface';
import logger from '../../utils/logger.util';

/**
 * @name topicsData
 * @description Reads and parses onboarding topic data from JSON file
 */
const topicsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../_data/topics.json'), 'utf-8'),
);

/**
 * @name seedTopics
 * @description Seeds the topics collection (categories + onboarding interests)
 * @returns {Promise<void>}
 */
const seedTopics = async (): Promise<void> => {
    try {
        const upserted: Array<any> = [];
        const superAdmin = await User.findOne({
            userType: UserType.SUPERADMIN,
        }).select('_id');
        const createdBy = superAdmin?._id;

        for (const topic of topicsData) {
            const doc = await Topic.findOneAndUpdate(
                { slug: topic.slug },
                {
                    $set: {
                        name: topic.name,
                        slug: topic.slug,
                        description: topic.description ?? '',
                        icon: topic.icon ?? '',
                        color: topic.color ?? '',
                        parentTopic: topic.parentTopic ?? '',
                        isActive: true,
                    },
                    $setOnInsert: {
                        code: `tpc-${new Date().getFullYear()}-${Random.randomNum(6)}`,
                        usageCount: 0,
                        trendingScore: 0,
                        ...(createdBy ? { createdBy } : {}),
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true },
            );
            if (doc) {
                upserted.push(doc);
            }
        }

        logger.log({
            data: `${upserted.length} topics upserted successfully`,
            type: 'info',
        });
    } catch (error) {
        logger.log({
            label: 'SEEDING_ERROR',
            data: `Failed to seed topics: ${(error as Error).message}`,
            type: 'error',
        });
        throw error;
    }
};

export default seedTopics;
