import footer from './footer.route';
import appRoutes from './app.route';
import { IRoute } from '@/utils/interfaces';
import productRoutes from './product.route';
import helpRoutes from './help.route';
import workspaceRoutes from './workspace.route';
import adminRoutes from './admin.route';

const routes: Array<IRoute> = [
    ...appRoutes,
    ...footer,
    ...productRoutes,
    ...helpRoutes,
    ...workspaceRoutes,
    ...adminRoutes,
];

export default routes;
