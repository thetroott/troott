import { createContext } from 'react';
import type { CreatorResponseDTO } from '@/dtos/creator.dto';

export interface CreatorContextValue {
    creator: CreatorResponseDTO | null;
    creatorId: string;
    isLoading: boolean;
    error: string | null;
    refresh: (options?: { force?: boolean }) => Promise<CreatorResponseDTO | null>;
}

const CreatorContext = createContext<CreatorContextValue | null>(null);

export default CreatorContext;
