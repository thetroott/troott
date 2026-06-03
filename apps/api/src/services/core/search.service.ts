import { search } from '@/utils/search.util';
import { IResult, IPagination } from '@/interfaces/common.interface';
import Sermon from '@/models/core/sermon.model';
import Series from '@/models/core/series.model';
import Minister from '@/models/core/minister.model';
import { MinisterStatus } from '@/interfaces/core/minister.interface';
import Playlist from '@/models/core/playlist.model';
import Topic from '@/models/core/topic.model';
import Listener from '@/models/core/listener.model';
import searchMapper from '@/mappers/search.mapper';
import {
    SearchResultDTO,
    SearchQueryOptions,
    SearchScope,
    RecentSearchDTO,
    TrendingSearchDTO,
} from '@/dtos/core/search.dto';

const RECENT_SEARCHES_CAP = 20;

const trendingMap = new Map<string, { count: number; lastAt: number }>();
const popularMap = new Map<string, number>();

class SearchService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    public async search(
        query: string,
        scope: SearchScope,
        options: SearchQueryOptions = {},
    ): Promise<IResult<SearchResultDTO>> {
        const result: IResult<SearchResultDTO> = {
            error: false,
            message: '',
            code: 200,
            data: {
                sermons: [],
                series: [],
                ministers: [],
                playlists: [],
                topics: [],
                totalCount: 0,
            },
        };

        if (!query.trim()) {
            result.error = true;
            result.message = 'Search query is required';
            result.code = 400;
            return result;
        }

        const page = options.page || 1;
        const limit = options.limit || 25;
        const perModelLimit = scope === 'all' ? Math.ceil(limit / 5) : limit;
        const modelOptions = { ...options, page, limit: perModelLimit };

        const tasks: Promise<void>[] = [];

        if (scope === 'all' || scope === 'sermon') {
            tasks.push(
                this.searchSermons(query, modelOptions).then((r) => {
                    if (!r.error) result.data.sermons = r.data as any;
                }),
            );
        }
        if (scope === 'all' || scope === 'series') {
            tasks.push(
                this.searchSeries(query, modelOptions).then((r) => {
                    if (!r.error) result.data.series = r.data as any;
                }),
            );
        }
        if (scope === 'all' || scope === 'minister') {
            tasks.push(
                this.searchMinisters(query, modelOptions).then((r) => {
                    if (!r.error) result.data.ministers = r.data as any;
                }),
            );
        }
        if (scope === 'all' || scope === 'playlist') {
            tasks.push(
                this.searchPlaylists(query, modelOptions).then((r) => {
                    if (!r.error) result.data.playlists = r.data as any;
                }),
            );
        }
        if (scope === 'all' || scope === 'topic') {
            tasks.push(
                this.searchTopics(query, modelOptions).then((r) => {
                    if (!r.error) result.data.topics = r.data as any;
                }),
            );
        }

        await Promise.all(tasks);

        result.data.totalCount =
            result.data.sermons.length +
            result.data.series.length +
            result.data.ministers.length +
            result.data.playlists.length +
            result.data.topics.length;

        result.message = 'Search completed';
        return result;
    }

    public async searchSermons(
        query: string,
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const regex = { $regex: query, $options: 'i' };
            const pagination: IPagination = await search({
                model: Sermon,
                ref: null,
                value: null,
                data: [
                    { title: regex },
                    { description: regex },
                    { tags: regex },
                    { searchText: regex },
                ],
                query: {},
                queryParam: {
                    page: String(options.page || 1),
                    limit: String(options.limit || 25),
                    sort: options.sort || 'title',
                    order: options.order || 'asc',
                    from: options.from,
                    to: options.to,
                },
                populate: [
                    {
                        path: 'minister',
                        select: 'firstName lastName ministerialName',
                    },
                    { path: 'series', select: 'title' },
                ],
                operator: 'or',
                fields: [],
            });

            result.data = searchMapper.mapSermons(pagination.data);
            result.pagination = pagination;
        } catch (error) {
            result.error = true;
            result.message = 'Sermon search failed';
            result.code = 500;
        }

        return result;
    }

    public async searchSeries(
        query: string,
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const regex = { $regex: query, $options: 'i' };
            const pagination: IPagination = await search({
                model: Series,
                ref: null,
                value: null,
                data: [{ title: regex }, { description: regex }],
                query: {},
                queryParam: {
                    page: String(options.page || 1),
                    limit: String(options.limit || 25),
                    sort: options.sort || 'title',
                    order: options.order || 'asc',
                    from: options.from,
                    to: options.to,
                },
                populate: [
                    {
                        path: 'minister',
                        select: 'firstName lastName ministerialName',
                    },
                ],
                operator: 'or',
                fields: [],
            });

            result.data = searchMapper.mapSeriesList(pagination.data);
            result.pagination = pagination;
        } catch (error) {
            result.error = true;
            result.message = 'Series search failed';
            result.code = 500;
        }

        return result;
    }

    public async searchMinisters(
        query: string,
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const regex = { $regex: query, $options: 'i' };
            const pagination: IPagination = await search({
                model: Minister,
                ref: null,
                value: null,
                data: [
                    { firstName: regex },
                    { lastName: regex },
                    { ministerialName: regex },
                    { 'profile.ministryName': regex },
                ],
                query: {},
                queryParam: {
                    page: String(options.page || 1),
                    limit: String(options.limit || 25),
                    sort: options.sort || 'firstName',
                    order: options.order || 'asc',
                    from: options.from,
                    to: options.to,
                },
                populate: [],
                operator: 'or',
                fields: [],
            });

            result.data = searchMapper.mapMinisters(pagination.data);
            result.pagination = pagination;
        } catch (error) {
            result.error = true;
            result.message = 'Minister search failed';
            result.code = 500;
        }

        return result;
    }

    public async searchPlaylists(
        query: string,
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const regex = { $regex: query, $options: 'i' };
            const pagination: IPagination = await search({
                model: Playlist,
                ref: null,
                value: null,
                data: [
                    { title: regex },
                    { description: regex },
                    { tags: regex },
                ],
                query: {},
                queryParam: {
                    page: String(options.page || 1),
                    limit: String(options.limit || 25),
                    sort: options.sort || 'title',
                    order: options.order || 'asc',
                    from: options.from,
                    to: options.to,
                },
                populate: [{ path: 'user', select: 'firstName lastName' }],
                operator: 'or',
                fields: [],
            });

            result.data = searchMapper.mapPlaylists(pagination.data);
            result.pagination = pagination;
        } catch (error) {
            result.error = true;
            result.message = 'Playlist search failed';
            result.code = 500;
        }

        return result;
    }

    /**
     * Lists active ministers for listener onboarding when `GET /search/ministers`
     * is called without a search query.
     */
    public async listActiveMinistersForOnboarding(
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const page = Math.max(1, options.page || 1);
            const limit = Math.min(100, Math.max(1, options.limit || 30));
            const skip = (page - 1) * limit;
            const sortField = options.sort || 'firstName';
            const sortOrder = options.order === 'desc' ? -1 : 1;

            const filter = {
                status: MinisterStatus.ACTIVE,
            };

            const [docs, total] = await Promise.all([
                Minister.find(filter)
                    .sort({ [sortField]: sortOrder, lastName: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Minister.countDocuments(filter),
            ]);

            result.data = searchMapper.mapMinisters(docs);
            result.message = 'Ministers listed';
            (result as any).pagination = {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) || 1,
                next: {
                    page: page * limit < total ? page + 1 : page,
                    limit,
                },
                prev: {
                    page: page > 1 ? page - 1 : page,
                    limit,
                },
            };
        } catch (error) {
            result.error = true;
            result.message = 'Minister list failed';
            result.code = 500;
        }

        return result;
    }

    public async searchTopics(
        query: string,
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const regex = { $regex: query, $options: 'i' };
            const pagination: IPagination = await search({
                model: Topic,
                ref: null,
                value: null,
                data: [{ name: regex }, { description: regex }],
                query: {},
                queryParam: {
                    page: String(options.page || 1),
                    limit: String(options.limit || 25),
                    sort: options.sort || 'name',
                    order: options.order || 'asc',
                    from: options.from,
                    to: options.to,
                },
                populate: [],
                operator: 'or',
                fields: [],
            });

            result.data = searchMapper.mapTopics(pagination.data);
            result.pagination = pagination;
        } catch (error) {
            result.error = true;
            result.message = 'Topic search failed';
            result.code = 500;
        }

        return result;
    }

    /**
     * Lists active selectable interests (leaf topics with a parent category).
     * Used when `GET /search/topics` is called without a search query (onboarding).
     */
    public async listActiveInterestTopics(
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const page = Math.max(1, options.page || 1);
            const limit = Math.min(100, Math.max(1, options.limit || 50));
            const skip = (page - 1) * limit;
            const sortField = options.sort || 'name';
            const sortOrder = options.order === 'desc' ? -1 : 1;

            const filter = {
                isActive: true,
                parentTopic: { $exists: true, $nin: ['', null] },
            };

            const [docs, total] = await Promise.all([
                Topic.find(filter)
                    .sort({ [sortField]: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Topic.countDocuments(filter),
            ]);

            result.data = searchMapper.mapTopics(docs);
            result.message = 'Topics listed';
            (result as any).pagination = {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) || 1,
                next: {
                    page: page * limit < total ? page + 1 : page,
                    limit,
                },
                prev: {
                    page: page > 1 ? page - 1 : page,
                    limit,
                },
            };
        } catch (error) {
            result.error = true;
            result.message = 'Topic list failed';
            result.code = 500;
        }

        return result;
    }

    public async searchWithinMinister(
        ministerId: string,
        query: string,
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const regex = { $regex: query, $options: 'i' };
            const pagination: IPagination = await search({
                model: Sermon,
                ref: 'minister',
                value: ministerId,
                data: [
                    { title: regex },
                    { description: regex },
                    { tags: regex },
                ],
                query: {},
                queryParam: {
                    page: String(options.page || 1),
                    limit: String(options.limit || 25),
                    sort: options.sort || 'title',
                    order: options.order || 'asc',
                    from: options.from,
                    to: options.to,
                },
                populate: [{ path: 'series', select: 'title' }],
                operator: 'or',
                fields: [],
            });

            result.data = searchMapper.mapSermons(pagination.data);
            result.pagination = pagination;
        } catch (error) {
            result.error = true;
            result.message = 'Scoped minister search failed';
            result.code = 500;
        }

        return result;
    }

    public async searchWithinSeries(
        seriesId: string,
        query: string,
        options: SearchQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const regex = { $regex: query, $options: 'i' };
            const pagination: IPagination = await search({
                model: Sermon,
                ref: 'series',
                value: seriesId,
                data: [
                    { title: regex },
                    { description: regex },
                    { tags: regex },
                ],
                query: {},
                queryParam: {
                    page: String(options.page || 1),
                    limit: String(options.limit || 25),
                    sort: options.sort || 'title',
                    order: options.order || 'asc',
                    from: options.from,
                    to: options.to,
                },
                populate: [
                    {
                        path: 'minister',
                        select: 'firstName lastName ministerialName',
                    },
                ],
                operator: 'or',
                fields: [],
            });

            result.data = searchMapper.mapSermons(pagination.data);
            result.pagination = pagination;
        } catch (error) {
            result.error = true;
            result.message = 'Scoped series search failed';
            result.code = 500;
        }

        return result;
    }

    public async autocomplete(query: string): Promise<IResult<string[]>> {
        const result: IResult<string[]> = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        if (!query.trim()) return result;

        const prefix = { $regex: `^${query}`, $options: 'i' };
        const limit = 8;

        try {
            const [sermons, ministers, topics] = await Promise.all([
                Sermon.find({ title: prefix })
                    .select('title')
                    .limit(limit)
                    .lean(),
                Minister.find({
                    $or: [
                        { firstName: prefix },
                        { lastName: prefix },
                        { ministerialName: prefix },
                    ],
                })
                    .select('firstName lastName ministerialName')
                    .limit(limit)
                    .lean(),
                Topic.find({ name: prefix })
                    .select('name')
                    .limit(limit)
                    .lean(),
            ]);

            const suggestions = new Set<string>();
            sermons.forEach((s: any) => suggestions.add(s.title));
            ministers.forEach((m: any) => {
                const name =
                    m.ministerialName ||
                    `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim();
                if (name) suggestions.add(name);
            });
            topics.forEach((t: any) => suggestions.add(t.name));

            result.data = Array.from(suggestions).slice(0, 10);
        } catch (error) {
            result.error = true;
            result.message = 'Autocomplete failed';
            result.code = 500;
        }

        return result;
    }

    public async getTrending(limit = 10): Promise<IResult<TrendingSearchDTO[]>> {
        const result: IResult<TrendingSearchDTO[]> = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        const now = Date.now();
        const windowMs = 7 * 24 * 60 * 60 * 1000; // 7 days

        const entries: TrendingSearchDTO[] = [];
        for (const [term, data] of trendingMap.entries()) {
            if (now - data.lastAt < windowMs) {
                entries.push({ term, count: data.count });
            }
        }

        entries.sort((a, b) => b.count - a.count);
        result.data = entries.slice(0, limit);
        return result;
    }

    public async getPopular(limit = 10): Promise<IResult<TrendingSearchDTO[]>> {
        const result: IResult<TrendingSearchDTO[]> = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        const entries: TrendingSearchDTO[] = [];
        for (const [term, count] of popularMap.entries()) {
            entries.push({ term, count });
        }

        entries.sort((a, b) => b.count - a.count);
        result.data = entries.slice(0, limit);
        return result;
    }

    public async getRecentSearches(
        listenerId: string,
        limit = 20,
    ): Promise<IResult<RecentSearchDTO[]>> {
        const result: IResult<RecentSearchDTO[]> = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        try {
            const listener = await Listener.findById(listenerId)
                .select('recentSearches')
                .lean();

            if (!listener) {
                result.error = true;
                result.message = 'Listener not found';
                result.code = 404;
                return result;
            }

            const searches = ((listener as any).recentSearches || []) as Array<{
                _id: any;
                query: string;
                searchedAt: string;
            }>;

            result.data = searches
                .slice(-limit)
                .reverse()
                .map((s) => ({
                    id: String(s._id),
                    query: s.query,
                    searchedAt: s.searchedAt,
                }));
        } catch (error) {
            result.error = true;
            result.message = 'Failed to get recent searches';
            result.code = 500;
        }

        return result;
    }

    public async saveRecentSearch(
        listenerId: string,
        query: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!query.trim()) {
            result.error = true;
            result.message = 'Search query is required';
            result.code = 400;
            return result;
        }

        const normalized = query.trim().toLowerCase();

        try {
            await Listener.findByIdAndUpdate(listenerId, {
                $pull: { recentSearches: { query: normalized } },
            });

            await Listener.findByIdAndUpdate(listenerId, {
                $push: {
                    recentSearches: {
                        $each: [
                            { query: normalized, searchedAt: new Date().toISOString() },
                        ],
                        $slice: -RECENT_SEARCHES_CAP,
                    },
                },
            });

            this.trackSearchTerm(normalized);

            result.message = 'Search saved';
        } catch (error) {
            result.error = true;
            result.message = 'Failed to save recent search';
            result.code = 500;
        }

        return result;
    }

    public async clearRecentSearches(listenerId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            await Listener.findByIdAndUpdate(listenerId, {
                $set: { recentSearches: [] },
            });
            result.message = 'Recent searches cleared';
        } catch (error) {
            result.error = true;
            result.message = 'Failed to clear recent searches';
            result.code = 500;
        }

        return result;
    }

    public async deleteRecentSearch(
        listenerId: string,
        searchId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            await Listener.findByIdAndUpdate(listenerId, {
                $pull: { recentSearches: { _id: searchId } },
            });
            result.message = 'Search entry deleted';
        } catch (error) {
            result.error = true;
            result.message = 'Failed to delete search entry';
            result.code = 500;
        }

        return result;
    }

    private trackSearchTerm(term: string): void {
        const existing = trendingMap.get(term);
        if (existing) {
            existing.count += 1;
            existing.lastAt = Date.now();
        } else {
            trendingMap.set(term, { count: 1, lastAt: Date.now() });
        }

        popularMap.set(term, (popularMap.get(term) || 0) + 1);
    }
}

export default new SearchService();
