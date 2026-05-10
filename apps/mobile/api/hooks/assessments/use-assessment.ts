/**
 * Assessment Query Hook
 * 
 * React Query hook for fetching a single assessment by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { assessmentsService } from '../../services';
import { Assessment } from '../../types';
import { queryKeys } from '../../utils/query-keys';

/**
 * Get assessment by ID query hook
 * 
 * @example
 * const { data: assessment, isLoading } = useAssessment('assessment-id');
 */
export const useAssessment = (assessmentId: string) => {
  return useQuery({
    queryKey: queryKeys.assessments.detail(assessmentId),
    queryFn: (): Promise<Assessment> => assessmentsService.getAssessmentById(assessmentId),
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

