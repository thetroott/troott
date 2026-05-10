import { useCallback, useEffect, useState } from 'react'
import { IAPIResponse, IFileUpload } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import AxiosService from '../../services/axios.service'
import { URL_STORAGE } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import { UploadFormat } from '../../utils/types.util'
import { apiresponse } from '../../_data/seed'
import { UploadFormatEnum } from '../../utils/enums.util'

interface IUploadFile {
    type: 'image' | 'pdf',
    file: IFileUpload | null,
    format: UploadFormat,
    name?: string,
}

const useUploader = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const {
        setResource,
    } = appContext

    useEffect(() => {

    }, [])

    const [loading, setLoading] = useState<boolean>(false);

    /**
     * @name uploadFile
     */
    const uploadFile = useCallback(async (data: IUploadFile) => {

        const { file, format, type, name } = data;
        let response: IAPIResponse = apiresponse;

        if (format === UploadFormatEnum.BASE64) {

            setLoading(true)

            response = await AxiosService.call({
                type: 'default',
                method: 'POST',
                isAuth: true,
                path: `${URL_STORAGE}/upload`,
                payload: {
                    type: type,
                    format: format,
                    name: name ? name : '',
                    base64: file?.base64 || ''
                }
            })

        }

        if (format === UploadFormatEnum.RAW_FILE) {

            const formData = new FormData();

            // append key/value
            formData.append('file', file?.raw || null)
            formData.append('format', format);
            formData.append('type', type)
            formData.append('name', name ? name : '')

            setLoading(true)

            response = await AxiosService.call({
                type: 'default',
                method: 'POST',
                isAuth: true,
                path: `${URL_STORAGE}/upload`,
                payload: formData
            })

        }


        if (response.error === false) {
            if (response.status === 200) {
                setLoading(false)
            }
        }

        if (response.error === true) {

            setLoading(false)

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not upload file ${response.data}`)
            }

        }

        return response

    }, [setLoading])

    /**
     * @name 
     */
    const checkUploadedFile = useCallback(async (data: { name: string, platform: string }) => {

        const { name, platform } = data;

        setLoading(true)

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_STORAGE}/check`,
            payload: {
                name: name,
                platform: platform
            }
        })


        if (response.error === false) {
            if (response.status === 200) {
                setLoading(false)
            }
        }

        if (response.error === true) {

            setLoading(false)

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not check uploaded file ${response.data}`)
            }

        }

        return response

    }, [setLoading])

    return {
        loading,

        uploadFile,
        checkUploadedFile
    }
}

export default useUploader