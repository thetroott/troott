/**
 * TanStack Query keys for Troott mobile API.
 */

export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        user: () => [...queryKeys.auth.all, 'user'] as const,
        login: () => [...queryKeys.auth.all, 'login'] as const,
        register: () => [...queryKeys.auth.all, 'register'] as const,
    },
    users: {
        all: ['users'] as const,
        me: () => [...queryKeys.users.all, 'me'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        list: (filters?: unknown) =>
            [...queryKeys.users.lists(), filters] as const,
    },
    listener: {
        all: ['listener'] as const,
        me: () => [...queryKeys.listener.all, 'me'] as const,
    },
    library: {
        all: ['library'] as const,
        user: (userId: string) =>
            [...queryKeys.library.all, 'user', userId] as const,
    },
    playlist: {
        all: ['playlist'] as const,
        user: (userId: string) =>
            [...queryKeys.playlist.all, 'user', userId] as const,
        detail: (id: string) =>
            [...queryKeys.playlist.all, 'detail', id] as const,
    },
    share: {
        all: ['share'] as const,
        resolve: (token: string, resourceId?: string) =>
            [...queryKeys.share.all, 'resolve', token, resourceId] as const,
    },
    discovery: {
        all: ['discovery'] as const,
        home: (params?: unknown) =>
            [...queryKeys.discovery.all, 'home', params] as const,
    },
    sermon: {
        all: ['sermon'] as const,
        detail: (id: string) =>
            [...queryKeys.sermon.all, 'detail', id] as const,
        minister: (ministerId: string, params?: unknown) =>
            [...queryKeys.sermon.all, 'minister', ministerId, params] as const,
        topic: (topic: string, params?: unknown) =>
            [...queryKeys.sermon.all, 'topic', topic, params] as const,
        userRecentlyPlayed: (params?: unknown) =>
            [...queryKeys.sermon.all, 'user', 'recently-played', params] as const,
        favoriteMinisters: (params?: unknown) =>
            [
                ...queryKeys.sermon.all,
                'user',
                'favorite-ministers',
                params,
            ] as const,
    },
    search: {
        all: ['search'] as const,
        catalog: (params?: unknown) =>
            [...queryKeys.search.all, 'catalog', params] as const,
        sermons: (params?: unknown) =>
            [...queryKeys.search.all, 'sermons', params] as const,
        ministers: (params?: unknown) =>
            [...queryKeys.search.all, 'ministers', params] as const,
        series: (params?: unknown) =>
            [...queryKeys.search.all, 'series', params] as const,
        topics: (params?: unknown) =>
            [...queryKeys.search.all, 'topics', params] as const,
        trending: (params?: unknown) =>
            [...queryKeys.search.all, 'trending', params] as const,
        popular: (params?: unknown) =>
            [...queryKeys.search.all, 'popular', params] as const,
        autocomplete: (q: string) =>
            [...queryKeys.search.all, 'autocomplete', q] as const,
    },
    playback: {
        all: ['playback'] as const,
        recent: () => [...queryKeys.playback.all, 'recent'] as const,
        sermon: (sermonId: string) =>
            [...queryKeys.playback.all, 'sermon', sermonId] as const,
    },
    minister: {
        all: ['minister'] as const,
        detail: (id: string) =>
            [...queryKeys.minister.all, 'detail', id] as const,
    },
    onboarding: {
        topics: ['onboarding', 'topics'] as const,
        ministers: ['onboarding', 'ministers'] as const,
    },
} as const;

export const libraryKeys = queryKeys.library;
export const playlistKeys = queryKeys.playlist;

/** Engine catalog cache key (replaces legacy QueryKeys.UserData). */
export const catalogUserDataKey = (userId: string, itemId: string) =>
    ['catalog', 'user', userId, itemId] as const;
