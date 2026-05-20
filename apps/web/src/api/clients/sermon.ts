import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_SERMON,
    URL_SERMON_BY_ID,
    URL_SERMON_DELETE,
    URL_SERMON_IMAGE_UPLOAD,
    URL_SERMON_MINISTER,
    URL_SERMON_MOVE_TO_BIN,
    URL_SERMON_PUBLISH,
    URL_SERMON_START_UPLOAD,
    URL_SERMON_TOPIC,
    URL_SERMON_UPDATE,
} from '../core/paths';
import type {
    PublishSermonDTO,
    UpdateSermonDTO,
} from '@/dtos/sermon.dto';
import type { AxiosProgressEvent } from 'axios';

class SermonAPI {
    constructor(private axiosService: AxiosService) {}

    getAllSermons(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SERMON,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getSermonById(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SERMON_BY_ID(id),
            isAuth: false,
            payload: {},
        });
    }

    getSermonsByTopic(topic: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SERMON_TOPIC(topic),
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getSermonsByMinister(
        ministerId: string,
        params?: IListQuery,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SERMON_MINISTER(ministerId),
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    updateSermon(id: string, payload: UpdateSermonDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_SERMON_UPDATE(id),
            isAuth: true,
            payload,
        });
    }

    moveSermonToBin(
        id: string,
        payload?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_SERMON_MOVE_TO_BIN(id),
            isAuth: true,
            payload: payload ?? {},
        });
    }

    publishSermon(id: string, payload: PublishSermonDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_SERMON_PUBLISH(id),
            isAuth: true,
            payload,
        });
    }

    deleteSermon(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: URL_SERMON_DELETE(id),
            isAuth: true,
            payload: {},
        });
    }

    startUpload(
        formData: FormData,
        onProgress?: (percent: number) => void,
        signal?: AbortSignal,
    ) {
        return this.axiosService.getHttpClient().post(URL_SERMON_START_UPLOAD, formData, {
            timeout: 0,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            signal,
            onUploadProgress: onProgress
                ? (evt: AxiosProgressEvent) => {
                      const total = evt.total;
                      if (total) {
                          onProgress(
                              Math.min(
                                  100,
                                  Math.round((evt.loaded / total) * 100),
                              ),
                          );
                      }
                  }
                : undefined,
        });
    }

    uploadCover(formData: FormData, onProgress?: (percent: number) => void) {
        return this.axiosService.getHttpClient().post(URL_SERMON_IMAGE_UPLOAD, formData, {
            timeout: 0,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            onUploadProgress: onProgress
                ? (evt: AxiosProgressEvent) => {
                      const total = evt.total;
                      if (total) {
                          onProgress(
                              Math.min(
                                  100,
                                  Math.round((evt.loaded / total) * 100),
                              ),
                          );
                      }
                  }
                : undefined,
        });
    }
}

export default SermonAPI;
