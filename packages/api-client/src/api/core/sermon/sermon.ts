import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';
import type { AxiosProgressEvent } from 'axios';

class SermonAPI {
    constructor(private axiosService: AxiosService) {}

    getAllSermons(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.sermon.root,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getSermonById(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.sermon.byId(id),
            isAuth: false,
        });
    }

    getSermonsByMinister(
        ministerId: string,
        params?: IListQuery,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.sermon.minister(ministerId),
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    updateSermon(id: string, payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.sermon.update(id),
            isAuth: true,
            payload,
        });
    }

    moveSermonToBin(id: string, payload?: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.sermon.moveToBin(id),
            isAuth: true,
            payload: payload ?? {},
        });
    }

    publishSermon(id: string, payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.sermon.publish(id),
            isAuth: true,
            payload,
        });
    }

    deleteSermon(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: P.sermon.delete(id),
            isAuth: true,
        });
    }

    startUpload(
        formData: FormData,
        onProgress?: (percent: number) => void,
        signal?: AbortSignal,
    ): Promise<IAPIResponse> {
        return this.axiosService
            .getHttpClient()
            .post(P.sermon.startUpload, formData, {
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

    uploadCover(
        formData: FormData,
        onProgress?: (percent: number) => void,
    ): Promise<IAPIResponse> {
        return this.axiosService
            .getHttpClient()
            .post(P.sermon.imageUpload, formData, {
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
