import sermonRepository from '../sermon/sermon.repository';
import { IQueryOptions } from '../../../utils/interfaces.util';

/** Lightweight home / discovery rails backed by existing sermon queries. */
class DiscoveryService {
    async homeRails(options: IQueryOptions = {}) {
        const base: IQueryOptions = {
            limit: options.limit ?? 12,
            skip: options.skip ?? 0,
            populate: options.populate ?? 'minister series category',
        };

        const [recent, mostPlayed, popularSession] = await Promise.all([
            sermonRepository.findAllSorted('releaseDate', {
                ...base,
                recentOnly: true,
            }),
            sermonRepository.findAllSorted('playCount', base),
            sermonRepository.findMostRecentlyPlayed(base),
        ]);

        return {
            recentlyPublished: recent.error ? [] : recent.data,
            mostPlayed: mostPlayed.error ? [] : mostPlayed.data,
            popularRecentlyPlayed: popularSession.error
                ? []
                : popularSession.data,
        };
    }
}

export default new DiscoveryService();
