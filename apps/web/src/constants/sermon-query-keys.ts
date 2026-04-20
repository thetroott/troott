/** React Query keys for sermon list / minister library (see SERMON_UPLOAD_IMPLEMENTATION_PLAN). */
export const sermonQueryKeys = {
  all: ['sermons'] as const,
  minister: (ministerId: string) =>
    [...sermonQueryKeys.all, 'minister', ministerId] as const,
};
