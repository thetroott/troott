import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    searchCatalog,
    searchSermons,
    searchMinisters,
    searchSeries,
    searchPlaylists,
    searchTopics,
    searchWithinMinister,
    searchWithinSeries,
    autocomplete,
    getTrending,
    getPopular,
    getRecentSearches,
    saveRecentSearch,
    clearRecentSearches,
    deleteRecentSearch,
} from '@/controllers/core/search.controller';

const searchRouter = Router({ mergeParams: true });

searchRouter.get('/', searchCatalog);
searchRouter.get('/sermons', searchSermons);
searchRouter.get('/ministers', searchMinisters);
searchRouter.get('/series', searchSeries);
searchRouter.get('/playlists', searchPlaylists);
searchRouter.get('/topics', searchTopics);

searchRouter.get('/minister/:ministerId', searchWithinMinister);
searchRouter.get('/series/:seriesId', searchWithinSeries);

searchRouter.get('/autocomplete', autocomplete);
searchRouter.get('/trending', getTrending);
searchRouter.get('/popular', getPopular);

searchRouter.get('/recent', Protect, getRecentSearches);
searchRouter.post('/recent', Protect, saveRecentSearch);
searchRouter.delete('/recent', Protect, clearRecentSearches);
searchRouter.delete('/recent/:id', Protect, deleteRecentSearch);

export default searchRouter;
