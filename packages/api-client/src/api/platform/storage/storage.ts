import AxiosService from '../../_base/axios';
import { IAPIResponse } from '../../_base/types';
import { P } from '../../_base/paths';
import type { AxiosProgressEvent } from 'axios';

class StorageAPI {
    constructor(private axiosService: AxiosService) {}

    uploadImage(
        payload: FormData,
        onProgress?: (percent: number) => void,
    ): Promise<IAPIResponse> {
        return this.axiosService.getHttpClient().post(P.storage.upload, payload, {
            timeout: 0,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            onUploadProgress: onProgress
                ? (evt: AxiosProgressEvent) => {
                      const total = evt.total;
                      if (total) {
                          onProgress(
                              Math.min(100, Math.round((evt.loaded / total) * 100)),
                          );
                      }
                  }
                : undefined,
        });
    }
}

export default StorageAPI;
