import { useCallback, useEffect, useState } from 'react';

import api from '@/api/config';
import type { IAPIResponse } from '@/api/types';
import type { IFileUpload } from '@/utils/interfaces.util';
import { UploadFormatEnum, type UploadFormat } from '@/utils/enums.util';

import useAuth from './useAuth';
import useNetwork from '../shared/useNetwork';

interface IUploadFile {
    type: 'image' | 'pdf';
    file: IFileUpload | null;
    format: UploadFormat;
    name?: string;
}

const useUploader = () => {
    const { popNetwork } = useNetwork(false);
    const { logout } = useAuth();

    useEffect(() => {}, []);

    const [loading, setLoading] = useState<boolean>(false);

    /**
     * @name uploadFile
     */
    const uploadFile = useCallback(
        async (data: IUploadFile) => {
            const { file, format, type, name } = data;

            if (format === UploadFormatEnum.RAW_FILE && file?.raw) {
                setLoading(true);
                const formData = new FormData();
                formData.append('file', file.raw);
                formData.append('format', format);
                formData.append('type', type);
                formData.append('name', name ?? '');

                try {
                    const axiosRes = await api.storage.uploadImage(formData);
                    setLoading(false);
                    return {
                        error: false,
                        status: axiosRes.status,
                        data: axiosRes.data,
                        message: '',
                        errors: [],
                    } satisfies IAPIResponse;
                } catch (e) {
                    setLoading(false);
                    const msg =
                        e instanceof Error ? e.message : 'Upload failed';
                    return {
                        error: true,
                        status: 0,
                        data: null,
                        message: msg,
                        errors: [],
                    } satisfies IAPIResponse;
                }
            }

            if (format === UploadFormatEnum.BASE64 && file?.base64) {
                setLoading(true);
                try {
                    const rawB64 = file.base64.includes(',')
                        ? file.base64.split(',')[1] ?? file.base64
                        : file.base64;
                    const byteString = atob(rawB64);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i += 1) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], {
                        type: 'application/octet-stream',
                    });
                    const uploadFileObj = new File(
                        [blob],
                        name ?? 'upload.bin',
                        {
                            type: 'application/octet-stream',
                        },
                    );
                    const axiosRes = await api.storage.uploadImage(
                        uploadFileObj,
                    );
                    setLoading(false);
                    return {
                        error: false,
                        status: axiosRes.status,
                        data: axiosRes.data,
                        message: '',
                        errors: [],
                    } satisfies IAPIResponse;
                } catch (e) {
                    setLoading(false);
                    const msg =
                        e instanceof Error ? e.message : 'Upload failed';
                    return {
                        error: true,
                        status: 0,
                        data: null,
                        message: msg,
                        errors: [],
                    } satisfies IAPIResponse;
                }
            }

            return {
                error: true,
                status: 400,
                data: null,
                message: 'Unsupported upload format',
                errors: [],
            } satisfies IAPIResponse;
        },
        [],
    );

    /**
     * @name checkUploadedFile
     */
    const checkUploadedFile = useCallback(
        async (data: { name: string; platform: string }) => {
            void data;
            void logout;
            void popNetwork;
            setLoading(false);
            return {
                error: true,
                status: 501,
                data: null,
                message: 'Not supported',
                errors: [],
            } satisfies IAPIResponse;
        },
        [logout, popNetwork],
    );

    return {
        loading,
        uploadFile,
        checkUploadedFile,
    };
};

export default useUploader;
