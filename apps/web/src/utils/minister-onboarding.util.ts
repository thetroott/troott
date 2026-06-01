import type { MinisterResponseDTO } from '@/dtos/minister.dto';

export function isMinisterOnboardingComplete(
    minister: MinisterResponseDTO | null | undefined,
): boolean {
    return minister?.onboarding?.status === 'completed';
}
