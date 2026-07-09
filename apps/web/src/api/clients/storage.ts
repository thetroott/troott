import type AxiosService from '@/api/core/axios';
import {
    URL_STORAGE_UPLOAD,
    URL_STORAGE_UPLOAD_DOCUMENT,
    URL_STORAGE_S3_MULTIPART_ABORT,
    URL_STORAGE_S3_MULTIPART_COMPLETE,
    URL_STORAGE_S3_MULTIPART_CREATE,
    URL_STORAGE_S3_MULTIPART_LIST_PARTS,
    URL_STORAGE_S3_MULTIPART_SIGN_PART,
} from '../core/paths';
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

    uploadDocument(
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

        return this.axiosService.getHttpClient().post(
            URL_STORAGE_UPLOAD_DOCUMENT,
            body,
            {
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
            },
        );
    }

    createStorageMultipart(body: {
        filename: string;
        contentType: string;
        contentLength: number;
        purpose?: 'storage-image' | 'storage-document';
    }) {
        return this.axiosService.getHttpClient().post(
            URL_STORAGE_S3_MULTIPART_CREATE,
            body,
        );
    }

    signStoragePart(body: { sessionId: string; partNumber: number }) {
        return this.axiosService.getHttpClient().post(
            URL_STORAGE_S3_MULTIPART_SIGN_PART,
            body,
        );
    }

    listStorageParts(sessionId: string) {
        return this.axiosService.getHttpClient().get(
            URL_STORAGE_S3_MULTIPART_LIST_PARTS,
            { params: { sessionId } },
        );
    }

    abortStorageMultipart(body: { sessionId: string }) {
        return this.axiosService.getHttpClient().post(
            URL_STORAGE_S3_MULTIPART_ABORT,
            body,
        );
    }

    completeStorageMultipart(body: {
        sessionId: string;
        parts: Array<{ partNumber: number; etag: string }>;
    }) {
        return this.axiosService.getHttpClient().post(
            URL_STORAGE_S3_MULTIPART_COMPLETE,
            body,
        );
    }
}

export default StorageAPI;
