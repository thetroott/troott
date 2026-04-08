import { IAppMetrics, IPagination, ISidebarProps, IToast } from "@/utils/interfaces";
import { ICoreResource, IHackDomain, IProjectDomain } from "./interface";
import { ICollection } from "./interface";
import sidebarRoutes from "../../routes/sidebar.route";
import { IAPIResponse } from "@/api/types";

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

const sidebar: ISidebarProps = {
    collapsed: false,
    route: sidebarRoutes[0]!,
    isOpen: false,
    subroutes: [],
    inroutes: []
}

const toast: IToast = {
    type: 'success',
    show: false,
    message: '',
    title: 'Feedback',
    position: 'top-right',
    close: () => { }
}

const metrics: IAppMetrics = {
    loading: false,
    message: '',
    type: 'default',
    resource: 'default',
    question: {
        total: 0, disabled: 0, enabled: 0,
        resource: { total: 0, disabled: 0, enabled: 0 }
    }
}

const coreResoruce: ICoreResource = {
    forms: [],
    blocks: [],
    questions: [],
    responses: []
}

const hackResource: IHackDomain = {
    hackathons: [],
    submissions: [],
    entries: [],
    squad: []
}

const projectResource: IProjectDomain = {
    projects: [],
    Teams: [],
    tasks: []
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
    coreResoruce,
    hackResource,
    projectResource
}