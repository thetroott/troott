import type { CreatorResponseDTO } from '@/dtos/creator.dto';

export function isCreatorOnboardingComplete(
    creator: CreatorResponseDTO | null | undefined,
): boolean {
    return creator?.onboarding?.status === 'completed';
}
