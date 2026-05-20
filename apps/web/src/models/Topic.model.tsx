export interface Topic {
    id: string;
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
    createdAt: string;
    _version?: number;
    _id?: string;
}

export default Topic;
