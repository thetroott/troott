import { Router } from 'express';
import { resolveShareLink } from './shareable-link.controller';

const shareableLinkRouter = Router({ mergeParams: true });

shareableLinkRouter.get('/resolve', resolveShareLink);

export default shareableLinkRouter;
