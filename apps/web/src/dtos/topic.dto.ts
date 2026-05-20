export interface CreateTopicDTO {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parentTopic?: string;
}

export interface UpdateTopicDTO {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    parentTopic?: string;
}

export interface TopicResponseDTO {
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
}
