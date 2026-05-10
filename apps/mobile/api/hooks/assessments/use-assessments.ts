/**
 * Assessments Query Hook
 * 
 * React Query hook for fetching assessments.
 */

import { useQuery } from '@tanstack/react-query';
import { assessmentsService } from '../../services';
import { Assessment } from '../../types';
import { queryKeys } from '../../utils/query-keys';

/**
 * Get assessments by category query hook
 * 
 * @example
 * const { data: assessments, isLoading } = useAssessmentsByCategory('love_and_emotions');
 */
export const useAssessmentsByCategory = (category: string) => {
  return useQuery({
    queryKey: queryKeys.assessments.byCategory(category),
    queryFn: (): Promise<Assessment[]> => assessmentsService.getAssessmentsByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get all assessments query hook
 * 
 * @example
 * const { data: assessments, isLoading } = useAllAssessments();
 */
export const useAllAssessments = () => {
  return useQuery({
    queryKey: queryKeys.assessments.list(),
    queryFn: (): Promise<Assessment[]> => assessmentsService.getAllAssessments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

