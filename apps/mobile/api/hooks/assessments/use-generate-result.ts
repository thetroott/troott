/**
 * Generate Assessment Result Hook
 * 
 * React Query mutation hook for generating assessment results.
 */

import { useMutation } from '@tanstack/react-query';
import { assessmentsService } from '../../services';
import {
    AssessmentResult,
    GenerateAssessmentResultRequest,
} from '../../types';

/**
 * Generate assessment result mutation hook
 * 
 * @example
 * const generateResult = useGenerateAssessmentResult();
 * generateResult.mutate({ answers: [...], category: 'love_and_emotions' });
 */
export const useGenerateAssessmentResult = () => {
  return useMutation({
    mutationFn: async (data: GenerateAssessmentResultRequest): Promise<AssessmentResult> => {
      return assessmentsService.generateResult(data);
    },
  });
};

