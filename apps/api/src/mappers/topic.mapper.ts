import type { TopicResponseDTO } from '@/dtos/core/topic.dto';
import type ITopicDoc from '@/interfaces/core/topic.interface';

const idOf = (doc: unknown): string => {
    if (doc == null) {
        return '';
    }
    const d = doc as { _id?: unknown; id?: unknown };
    if (d._id != null) {
        return String(d._id);
    }
    if (d.id != null) {
        return String(d.id);
    }
    return '';
};

class TopicMapper {
    public async mapTopicResponse(topic: ITopicDoc): Promise<TopicResponseDTO> {
        const t = topic as any;

        return {
            id: idOf(topic),
            code: t.code ?? '',
            name: t.name ?? '',
            slug: t.slug ?? '',
            description: t.description ?? '',
            icon: t.icon ?? '',
            color: t.color ?? '',
            parentTopic: t.parentTopic ?? '',
            usageCount: t.usageCount ?? 0,
            trendingScore: t.trendingScore ?? 0,
            isActive: Boolean(t.isActive),
            createdAt: t.createdAt ?? '',
        };
    }

    public async mapTopicsResponse(
        topics: ITopicDoc[],
    ): Promise<TopicResponseDTO[]> {
        return Promise.all(topics.map((t) => this.mapTopicResponse(t)));
    }
}

export default new TopicMapper();
