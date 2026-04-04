import { CallApiDTO } from '../../dtos/axios.dto';
import { IAPIResponse } from '../types';
declare class AxiosService {
    readonly baseUrl: string;
    constructor(baseUrl: string);
    /**
     * @name call
     * @param params
     * @returns
     */
    call(params: CallApiDTO): Promise<IAPIResponse>;
    /**
     * @name logout
     */
    logout(): Promise<void>;
}
export default AxiosService;
//# sourceMappingURL=axios.d.ts.map