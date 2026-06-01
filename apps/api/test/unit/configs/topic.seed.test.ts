import { describe, it, expect } from '@jest/globals';
import Topic from '@/models/core/topic.model';
import fs from 'fs';
import path from 'path';

const topicsJsonPath = path.join(
    __dirname,
    '../../../src/_data/topics.json',
);

describe('topics seed data', () => {
    const topics = JSON.parse(fs.readFileSync(topicsJsonPath, 'utf-8')) as Array<{
        slug: string;
        name: string;
        parentTopic?: string;
        description?: string;
    }>;

    it('defines 5 categories and 20 selectable interests', () => {
        const categories = topics.filter((t) => !t.parentTopic);
        const interests = topics.filter((t) => t.parentTopic);
        expect(categories).toHaveLength(5);
        expect(interests).toHaveLength(20);
    });

    it('has unique slugs', () => {
        const slugs = topics.map((t) => t.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('links every interest to a known category slug', () => {
        const categorySlugs = new Set(
            topics.filter((t) => !t.parentTopic).map((t) => t.slug),
        );
        for (const interest of topics.filter((t) => t.parentTopic)) {
            expect(categorySlugs.has(interest.parentTopic!)).toBe(true);
        }
    });

    it('entries validate against Topic schema', () => {
        for (const topic of topics) {
            const doc = new Topic({
                code: `tpc-test-${topic.slug}`,
                name: topic.name,
                slug: topic.slug,
                description: topic.description ?? '',
                parentTopic: topic.parentTopic ?? '',
                isActive: true,
            });
            const err = doc.validateSync();
            expect(err).toBeUndefined();
        }
    });
});
