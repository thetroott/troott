import User from './User.model';

interface Topic {
    code: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;

    parentTopic: string;

    usageCount: number;
    trendingScore: number;
    isActive: boolean;

    createdBy: User | any;

    createdAt: string;
    updatedAt: string;

    _version: number;
    _id: string;
    id: string;
}

export default Topic;
