import { Router } from 'express';
import { getPublicSermonTeaser } from '@/controllers/open.controller';

const openRouter = Router({ mergeParams: true });

openRouter.get('/sermon/:id', getPublicSermonTeaser);

export default openRouter;
