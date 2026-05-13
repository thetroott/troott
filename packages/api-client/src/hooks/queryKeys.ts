export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    discovery: {
        home: ['discovery', 'home'] as const,
    },
    library: {
        mine: (userId: string) => ['library', 'user', userId] as const,
    },
    sermon: {
        detail: (id: string) => ['sermon', id] as const,
        byMinister: (ministerId: string) =>
            ['sermon', 'minister', ministerId] as const,
    },
    search: {
        catalog: (q: string) => ['search', q] as const,
    },
};
