import { createContext } from 'react';
import type { StudioResponseDTO } from '@/dtos/studio.dto';
import type { StudioRole } from '@/dtos/api-domain';

export interface StudioContextValue {
    studio: StudioResponseDTO | null;
    role: StudioRole | null;
    activeStudioId: string;
    studioCode: string;
    isLoading: boolean;
    error: string | null;
    refresh: (options?: { force?: boolean }) => Promise<{
        studio: StudioResponseDTO | null;
        role: StudioRole | null;
    }>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export default StudioContext;
