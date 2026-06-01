
import type { ICollection } from "./interface";
import { IAPIResponse } from "@/api/types";
import { IPagination } from "@/utils/interfaces.util";

const pagination: IPagination = {
    next: { page: 1, limit: 25 },
    prev: { page: 1, limit: 25 },
}

const collection: ICollection = {
    data: [],
    count: 0,
    total: 0,
    pagination: pagination,
    loading: false,
    message: 'There are no data currently'
}

const sidebar: any = {
    collapsed: false,
    route: [],
    isOpen: false,
    subroutes: [],
    inroutes: []
}

const toast: any = {
    type: 'success',
    show: false,
    message: '',
    title: 'Feedback',
    position: 'top-right',
    close: () => { }
}

const metrics: any = {
    loading: false,
    message: '',
    type: 'default',
    resource: 'default',
    question: {
        total: 0, disabled: 0, enabled: 0,
        resource: { total: 0, disabled: 0, enabled: 0 }
    }
}

const apiresponse: IAPIResponse = {
    error: false,
    errors: [],
    report: {
        format: '',
        csv: '',
        pdf: '',
        xml: ''
    },
    count: 0,
    total: 0,
    pagination: pagination,
    data: null,
    message: '',
    token: '',
    status: 200
}



export {
    pagination,
    collection,
    sidebar,
    apiresponse,
    metrics,
    toast,
};