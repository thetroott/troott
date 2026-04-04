import { IInRoute, IRouteItem } from '@/utils/interfaces';
import { RouteActionType } from '@/utils/types';
interface IToDetails {
    id?: string;
    route: string;
    name?: string;
    subroute?: string;
}
declare const useGoTo: () => {
    goTo: (url: string) => void;
    navigate: import("react-router-dom").NavigateFunction;
    computePath: (route: string) => string;
    toDetailRoute: (e: any, options: IToDetails) => void;
    toMainRoute: (e: any, name: string) => void;
    getSubroutes: (name: string) => Array<IRouteItem>;
    getInRoutes: (name: string) => Array<IInRoute>;
    getRoute: (name: string, subroute?: string) => IRouteItem;
    getRouteAction: (action?: RouteActionType) => string;
    location: import("react-router-dom").Location<any>;
};
export default useGoTo;
//# sourceMappingURL=useGoTo.d.ts.map