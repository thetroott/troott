import sermonRepository from '../sermon/sermon.repository';
import ministerRepository from '../../users/minister/minister.repository';
import { IResult } from '../../../utils/interfaces.util';

export type SearchScope = 'sermon' | 'minister' | 'all';

class SearchService {
    async search(
        q: string,
        scope: SearchScope,
        options: { limit?: number; skip?: number },
    ): Promise<{ sermons?: unknown; ministers?: unknown; errors: string[] }> {
        const errors: string[] = [];
        const limit = options.limit;
        const skip = options.skip;

        let sermons: unknown;
        let ministers: unknown;

        if (scope === 'sermon' || scope === 'all') {
            const r: IResult = await sermonRepository.searchSermons(q, {
                limit: scope === 'all' ? Math.ceil((limit ?? 25) / 2) : limit,
                skip,
            });
            if (r.error) {
                errors.push(r.message || 'sermon search failed');
            }
            sermons = r.data;
        }

        if (scope === 'minister' || scope === 'all') {
            const r = await ministerRepository.searchMinisters(q, {
                limit: scope === 'all' ? Math.ceil((limit ?? 25) / 2) : limit,
                skip,
            });
            if (r.error) {
                errors.push(r.message || 'minister search failed');
            }
            ministers = r.data;
        }

        return { sermons, ministers, errors };
    }
}

export default new SearchService();
