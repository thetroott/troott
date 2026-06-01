import { createContext } from 'react';
import type { MinisterResponseDTO } from '@/dtos/minister.dto';

export interface MinisterContextValue {
    minister: MinisterResponseDTO | null;
    ministerId: string;
    isLoading: boolean;
    error: string | null;
    refresh: (options?: { force?: boolean }) => Promise<MinisterResponseDTO | null>;
}

const MinisterContext = createContext<MinisterContextValue | null>(null);

export default MinisterContext;
