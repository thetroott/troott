import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/_base/types';
import {
    CreatDTO,
    GetCatDTO,
    UpdateCatDTO,
} from '@/dtos/sermon.dto';
import { IListQuery } from '@/utils/interfaces';
import { URL_CATALOG, URL_CATALOGS } from '@/utils/path';

class CatalogAPI {
    constructor(private axiosService: AxiosService) {}

    getCat(payload: GetCatDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: `${URL_CATALOG}/${payload.id}`,
            isAuth: true,
            payload: {},
        });
    }

    getCatalogs(payload: IListQuery): Promise<IAPIResponse> {
        const { limit, page, order } = payload;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: `${URL_CATALOGS}?${q}`,
            isAuth: true,
            payload: {},
        });
    }

    createCat(payload: CreateCatDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CATALOGS,
            isAuth: true,
            payload,
        });
    }

    updateCat(payload: UpdateCatDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: `${URL_CATALOG}/${payload.id}`,
            isAuth: true,
            payload,
        });
    }
}

export default CatalogAPI;
