import type { ISermonDoc } from '@/interfaces/core/sermon.interface';
import type { ISeriesDoc } from '@/interfaces/core/series.interface';
import type { IMinisterDoc } from '@/interfaces/core/minister.interface';
import type { IPlaylistDoc } from '@/interfaces/core/playlist.interface';
import type ITopicDoc from '@/interfaces/core/topic.interface';
import {
    SermonSearchCard,
    SeriesSearchCard,
    MinisterSearchCard,
    PlaylistSearchCard,
    TopicSearchCard,
} from '@/dtos/core/search.dto';

class SearchMapper {
    public mapSermon(doc: any): SermonSearchCard {
        const minister = doc.minister?.[0] || doc.minister;
        return {
            id: String(doc._id ?? doc.id),
            title: doc.title ?? '',
            imageUrl: doc.imageUrl,
            duration: doc.duration,
            ministerName: minister
                ? `${minister.firstName ?? ''} ${minister.lastName ?? ''}`.trim()
                : undefined,
            seriesTitle:
                typeof doc.series === 'object' ? doc.series?.title : undefined,
            slug: doc.slug,
            preachedAt: doc.preachedAt,
        };
    }

    public mapSermons(docs: any[]): SermonSearchCard[] {
        return docs.map((d) => this.mapSermon(d));
    }

    public mapSeries(doc: any): SeriesSearchCard {
        const minister = doc.minister?.[0] || doc.minister;
        return {
            id: String(doc._id ?? doc.id),
            title: doc.title ?? '',
            imageUrl: doc.imageUrl ?? doc.coverImage,
            sermonCount: doc.sermonCount ?? doc.sermons?.length ?? 0,
            ministerName: minister
                ? `${minister.firstName ?? ''} ${minister.lastName ?? ''}`.trim()
                : undefined,
            slug: doc.slug,
        };
    }

    public mapSeriesList(docs: any[]): SeriesSearchCard[] {
        return docs.map((d) => this.mapSeries(d));
    }

    public mapMinister(doc: any): MinisterSearchCard {
        return {
            id: String(doc._id ?? doc.id),
            firstName: doc.firstName ?? '',
            lastName: doc.lastName ?? '',
            ministerialName: doc.ministerialName ?? doc.profile?.ministerialName,
            avatar:
                typeof doc.avatar === 'string'
                    ? doc.avatar
                    : doc.avatar?.s3Key,
            slug: doc.slug,
        };
    }

    public mapMinisters(docs: any[]): MinisterSearchCard[] {
        return docs.map((d) => this.mapMinister(d));
    }

    public mapPlaylist(doc: any): PlaylistSearchCard {
        return {
            id: String(doc._id ?? doc.id),
            title: doc.title ?? '',
            banner: doc.banner,
            itemsCount: doc.itemsCount ?? doc.items?.length ?? 0,
            ownerName: doc.user
                ? `${doc.user.firstName ?? ''} ${doc.user.lastName ?? ''}`.trim()
                : undefined,
            slug: doc.slug,
        };
    }

    public mapPlaylists(docs: any[]): PlaylistSearchCard[] {
        return docs.map((d) => this.mapPlaylist(d));
    }

    public mapTopic(doc: any): TopicSearchCard {
        return {
            id: String(doc._id ?? doc.id),
            name: doc.name ?? '',
            slug: doc.slug ?? '',
            description: doc.description,
            icon: doc.icon,
            color: doc.color,
            usageCount: doc.usageCount ?? 0,
        };
    }

    public mapTopics(docs: any[]): TopicSearchCard[] {
        return docs.map((d) => this.mapTopic(d));
    }
}

export default new SearchMapper();
