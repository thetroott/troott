import AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/_base/types';
import { URL_STORAGE_UPLOAD } from '@/utils/path';

class StorageAPI {
    constructor(private axiosService: AxiosService) {}

    /**
     * @name uploadImage
     * @description Uploads an image file and returns image DTO
     * @param {FormData} payload FormData containing the image file
     * @returns {Promise<IAPIResponse>} Server response with image DTO
     */
    uploadImage(payload: FormData): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_STORAGE_UPLOAD,
            isAuth: true,
            payload,
        });
    }
}

export default StorageAPI;
