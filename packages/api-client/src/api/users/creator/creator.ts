import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class CreatorAPI {
    constructor(private axiosService: AxiosService) {}

    getCreatorProfile(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.creator.root,
            isAuth: true,
        });
    }

    getCreators(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.creator.list,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getCreator(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.creator.byId(id),
            isAuth: true,
        });
    }

    createCreator(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.creator.root,
            isAuth: true,
            payload,
        });
    }

    updateCreator(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.creator.root,
            isAuth: true,
            payload,
        });
    }
}

export default CreatorAPI;
