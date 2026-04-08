import { IPagination, ISidebarProps, IToast } from "@/utils/interfaces";
import { ICollection } from "../helpers/interface";
import sidebarRoutes from "../../routes/sidebar.route";

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


export { 
    
    pagination, 
    collection, 
    sidebar,
    toast
}