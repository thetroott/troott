import { Router } from 'express';
import { searchCatalog } from '@/controllers/search.controller';

const searchRouter = Router({ mergeParams: true });

/** Public catalogue search (public sermons / ministers only). */
searchRouter.get('/', searchCatalog);

export default searchRouter;
