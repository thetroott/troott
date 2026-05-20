import type AxiosService from '@/api/core/axios';
import { URL_STORAGE_UPLOAD } from '../core/paths';
import type { AxiosProgressEvent } from 'axios';

class StorageAPI {
    constructor(private axiosService: AxiosService) {}

    /**
     * Upload an image. Accepts a `File` (wrapped as `FormData` field `file`) or a ready `FormData`.
     */
    uploadImage(
        payload: FormData | File,
        onProgress?: (percent: number) => void,
    ) {
        const body =
            payload instanceof FormData
                ? payload
                : (() => {
                      const fd = new FormData();
                      fd.append('file', payload);
                      return fd;
                  })();

        return this.axiosService.getHttpClient().post(URL_STORAGE_UPLOAD, body, {
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

export default StorageAPI;
