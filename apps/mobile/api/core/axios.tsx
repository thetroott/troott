import { CallApiDTO } from '@/dtos/axios.dto';
import { storage } from '@/services/storage-service';

import { IAPIResponse } from '@/utils/interface.utl';
import Axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_TROOTT_API_URL;

class AxiosService {
    public baseUrl: string;
    constructor() {
        if (!baseURL) {
            throw new Error('EXPO_PUBLIC_TROOTT_API_URL is not set');
        }

        this.baseUrl = baseURL;
    }

    /**
     * @name call
     * @param params
     * @returns
     */
    public async call(params: CallApiDTO): Promise<IAPIResponse> {
        let result: any = {};
        const { isAuth = false, method, path, type, payload } = params;

        let urlpath = `${this.baseUrl}${path}`;

        const headerConfig = isAuth
            ? await storage.getConfigWithBearer()
            : storage.getConfig();

        await Axios({
            method: method,
            url: urlpath,
            data: payload,
            headers: headerConfig.headers,
        })
            .then((resp) => {
                result = resp.data;
            })
            .catch((err) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        result.error = true;

                        if (err.response.data.errors) {
                            result.errors = err.response.data.errors;
                        } else if (err.response.data.message) {
                            result.message = err.response.data.message;
                        } else {
                            result.message = 'unable to get requested resource';
                        }

                        result.data = null;
                    } else if (err.response.status === 502) {
                        result.error = true;

                        if (err.response.data.errors) {
                            result.errors = err.response.data.errors;
                        } else if (err.response.data.message) {
                            result.message = err.response.data.message;
                        } else {
                            result.message = 'unable to get requested resource';
                        }

                        result.data = null;
                    } else {
                        if (err.response.data) {
                            result = err.response.data;
                        } else {
                            result.error = true;
                            result.errors = ['an error occured'];
                            result.message = 'An error occured';
                            result.data = null;
                        }
                    }
                } else if (typeof err === 'object') {
                    result.error = true;
                    result.errors = ['an error occurred. please try again'];
                    result.message = 'Error';
                    result.data = err;
                } else if (typeof err === 'string') {
                    result.error = true;
                    result.errors = [err.toString()];
                    result.message = err.toString();
                    result.data = err.toString();
                }
            });

        return result;
    }

    /**
     * @name logout
     */
    public async logout(): Promise<void> {
        storage.clearAuth();
        await this.call({
            method: 'POST',
            type: 'default',
            path: '/auth/logout',
            isAuth: false,
            payload: {},
        });
    }
}

export default new AxiosService();
