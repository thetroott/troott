/** React Query keys for sermon list / minister library (see SERMON_UPLOAD_IMPLEMENTATION_PLAN). */

export const MY_SERMONS_PAGE_SIZE = 16;

/** Params mirrored to GET /sermon/minister/:id (debounced `q` lives in parent). */
export type MinisterSermonListParams = {
  page: number;
  limit: number;
  sort: string;
  q: string;
  status: 'all' | 'draft' | 'published';
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_MINISTER_LIST_PARAMS: MinisterSermonListParams = {
  page: 1,
  limit: MY_SERMONS_PAGE_SIZE,
  sort: '-updatedAt',
  q: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export const sermonQueryKeys = {
  all: ['sermons'] as const,
  /** Prefix — invalidates every minister list variant for this id. */
  ministerListRoot: (ministerId: string) =>
    [...sermonQueryKeys.all, 'minister', ministerId] as const,
  ministerList: (ministerId: string, params: MinisterSermonListParams) =>
    [...sermonQueryKeys.ministerListRoot(ministerId), params] as const,
};
