import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/types';
import {
    CreateWorkspaceDTO,
    GetWorkspaceDTO,
    UpdateWorkspaceDTO,
} from '@/dtos/sermon.dto';
import { IListQuery } from '@/utils/interfaces';
import { URL_WORKSPACE, URL_WORKSPACES } from '@/utils/path';

class WorkspaceAPI {
    constructor(private axiosService: AxiosService) {}

    getWorkspace(payload: GetWorkspaceDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: `${URL_WORKSPACE}/${payload.id}`,
            isAuth: true,
            payload: {},
        });
    }

    getWorkspaces(payload: IListQuery): Promise<IAPIResponse> {
        const { limit, page, order } = payload;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: `${URL_WORKSPACES}?${q}`,
            isAuth: true,
            payload: {},
        });
    }

    createWorkspace(payload: CreateWorkspaceDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_WORKSPACES,
            isAuth: true,
            payload,
        });
    }

    updateWorkspace(payload: UpdateWorkspaceDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: `${URL_WORKSPACE}/${payload.id}`,
            isAuth: true,
            payload,
        });
    }
}

export default WorkspaceAPI;
