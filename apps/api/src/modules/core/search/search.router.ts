import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import { searchCatalog } from './search.controller';

const searchRouter = Router({ mergeParams: true });

searchRouter.get('/', Protect, searchCatalog);

export default searchRouter;
