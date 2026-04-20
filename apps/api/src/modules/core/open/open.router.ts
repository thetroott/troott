import { Router } from 'express';
import { getPublicSermonTeaser } from './open.controller';

const openRouter = Router({ mergeParams: true });

openRouter.get('/sermon/:id', getPublicSermonTeaser);

export default openRouter;
