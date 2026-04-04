import AxiosService from '../core/axios';
import AuthAPI from './auth';
import WorkspaceAPI from './workspace';
import UserAPI from './user';
/**
 * Internal API client
 * Holds all feature modules
 */
declare class PacepardAPIClient {
    auth: AuthAPI;
    workspace: WorkspaceAPI;
    user: UserAPI;
    constructor(axiosService: AxiosService);
}
/**
 * Accessor used by hooks and internal helpers
 */
export declare function pacepardAPIClient(): PacepardAPIClient;
/**
 * Main SDK class exposed to users
 *
 * Example:
 * const pacepard = new Pacepard('http://localhost:5015/api/v1')
 * await pacepard.auth.loginUser(...)
 */
declare class Pacepard extends PacepardAPIClient {
    constructor(baseUrl: string);
}
export default Pacepard;
//# sourceMappingURL=pacepard.d.ts.map