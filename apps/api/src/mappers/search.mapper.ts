import {
    SermonSearchCard,
    SeriesSearchCard,
    MinisterSearchCard,
    PlaylistSearchCard,
    TopicSearchCard,
} from '@/dtos/core/search.dto';

function docId(doc: { _id?: unknown; id?: unknown }): string {
    if (doc._id != null) {
        return String(doc._id);
    }
    if (doc.id != null) {
        return String(doc.id);
    }
    return '';
}

function firstMinisterFromSearchDoc(doc: any): any {
    if (Array.isArray(doc.ministers) && doc.ministers.length > 0) {
        return doc.ministers[0];
    }
    if (Array.isArray(doc.minister) && doc.minister.length > 0) {
        return doc.minister[0];
    }
    if (doc.minister && !Array.isArray(doc.minister)) {
        return doc.minister;
    }
    return undefined;
}

function ministerDisplayName(minister: any): string | undefined {
    if (!minister) {
        return undefined;
    }
    const name = `${minister.firstName ?? ''} ${minister.lastName ?? ''}`.trim();
    if (name) {
        return name;
    }
    return undefined;
}

function seriesTitleFromRef(series: unknown): string | undefined {
    if (series && typeof series === 'object' && 'title' in series) {
        const t = (series as { title?: string }).title;
        if (t != null) {
            return t;
        }
    }
    return undefined;
}

class SearchMapper {
    public mapSermon(doc: any): SermonSearchCard {
        const minister = firstMinisterFromSearchDoc(doc);
        return {
            id: docId(doc),
            title: doc.title ?? '',
            imageUrl: doc.imageUrl,
            duration: doc.duration,
            ministerName: ministerDisplayName(minister),
            seriesTitle: seriesTitleFromRef(doc.series),
            slug: doc.slug,
            preachedAt: doc.preachedAt,
        };
    }

    public mapSermons(docs: any[]): SermonSearchCard[] {
        return docs.map((d) => this.mapSermon(d));
    }

    public mapSeries(doc: any): SeriesSearchCard {
        const minister = firstMinisterFromSearchDoc(doc);
        let imageUrl: string | undefined;
        if (doc.imageUrl) {
            imageUrl = doc.imageUrl;
        } else {
            imageUrl = doc.coverImage;
        }

        let sermonCount = 0;
        if (doc.sermonCount != null) {
            sermonCount = doc.sermonCount;
        } else if (Array.isArray(doc.sermons)) {
            sermonCount = doc.sermons.length;
        }

        return {
            id: docId(doc),
            title: doc.title ?? '',
            imageUrl,
            sermonCount,
            ministerName: ministerDisplayName(minister),
            slug: doc.slug,
        };
    }

    public mapSeriesList(docs: any[]): SeriesSearchCard[] {
        return docs.map((d) => this.mapSeries(d));
    }

    public mapMinister(doc: any): MinisterSearchCard {
        let avatar: string | undefined;
        if (typeof doc.avatar === 'string') {
            avatar = doc.avatar;
        } else {
            avatar = doc.avatar?.s3Key;
        }

        let ministerialName: string | undefined;
        if (doc.ministerialName) {
            ministerialName = doc.ministerialName;
        } else {
            ministerialName = doc.profile?.ministerialName;
        }

        return {
            id: docId(doc),
            firstName: doc.firstName ?? '',
            lastName: doc.lastName ?? '',
            ministerialName,
            avatar,
            slug: doc.slug,
        };
    }

    public mapMinisters(docs: any[]): MinisterSearchCard[] {
        return docs.map((d) => this.mapMinister(d));
    }

    public mapPlaylist(doc: any): PlaylistSearchCard {
        let itemsCount = 0;
        if (doc.itemsCount != null) {
            itemsCount = doc.itemsCount;
        } else if (Array.isArray(doc.items)) {
            itemsCount = doc.items.length;
        }

        let ownerName: string | undefined;
        if (doc.user) {
            ownerName = `${doc.user.firstName ?? ''} ${doc.user.lastName ?? ''}`.trim();
            if (!ownerName) {
                ownerName = undefined;
            }
        } else {
            ownerName = undefined;
        }

        return {
            id: docId(doc),
            title: doc.title ?? '',
            banner: doc.banner,
            itemsCount,
            ownerName,
            slug: doc.slug,
        };
    }

    public mapPlaylists(docs: any[]): PlaylistSearchCard[] {
        return docs.map((d) => this.mapPlaylist(d));
    }

    public mapTopic(doc: any): TopicSearchCard {
        return {
            id: docId(doc),
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
