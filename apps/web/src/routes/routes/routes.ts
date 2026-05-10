import footer from './footer.route';
import appRoutes from './app.route';
import { IRoute } from '@/utils/interfaces';
import productRoutes from './product.route';
import helpRoutes from './help.route';
import adminRoutes from './admin.route';

const routes: Array<IRoute> = [
    ...appRoutes,
    ...footer,
    ...productRoutes,
    ...helpRoutes,
    ...adminRoutes,
];

export default routes;
