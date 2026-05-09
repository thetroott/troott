import {
    QueryClient,
    QueryClientProvider,
    type DefaultOptions,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

const defaultOptions: DefaultOptions = {
    queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
    },
};

export function createQueryClient(): QueryClient {
    return new QueryClient({ defaultOptions });
}

function isDevelopmentEnv(): boolean {
    const proc = (
        globalThis as unknown as {
            process?: { env?: Record<string, string | undefined> };
        }
    ).process;
    return proc?.env?.NODE_ENV === 'development';
}

export function TroottQueryProvider(props: {
    children: ReactNode;
    client?: QueryClient;
}) {
    const client = props.client ?? createQueryClient();
    return (
        <QueryClientProvider client={client}>
            {props.children}
            {isDevelopmentEnv() ? (
                <ReactQueryDevtools initialIsOpen={false} />
            ) : null}
        </QueryClientProvider>
    );
}
