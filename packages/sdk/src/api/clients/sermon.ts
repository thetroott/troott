import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/types';
import { CreateWorkspaceDTO, GetWorkspaceDTO, UpdateWorkspaceDTO } from '@/dtos/sermon.dto';
import { IListQuery } from '@/utils/interfaces';
import { URL_WORKSPACE, URL_WORKSPACES } from '@/utils/path';

class WorkspaceAPI {
    constructor(private axiosService: AxiosService) {}

    /**
     * @name getSermon
     * @description Register a new user account.
     * @param {getSermonDTO} payload The data needed to register the user.
     * @param {string} payload.id The Sermon ID.
     * @returns {Promise<IAPIResponse>} Server response with user info.
     */
    getSermon(payload: GetSermonDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_Sermon,
            isAuth: true,
            payload,
        });
    }

    getSermons(payload: IListQuery): Promise<IAPIResponse> {
        
        const { limit, page, order } = payload;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;
        
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: `${URL_SermonS}?${q}`,
            isAuth: true,
            payload
        });
        
    }

    createSermon(payload: CreateSermonDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_Sermon,
            isAuth: true,
            payload
        });
    }

    updateSermon(payload: UpdateSermonDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_Sermon,
            isAuth: true,
            payload
        });
    }
}

export default SermonAPI;
