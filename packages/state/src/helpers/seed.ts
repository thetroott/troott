import type { ICollection, IPagination, ISidebarProps, IToastState } from './interface';

const pagination: IPagination = {
    next: { page: 1, limit: 25 },
    prev: { page: 1, limit: 25 },
};

export const collection: ICollection = {
    data: [],
    count: 0,
    total: 0,
    pagination,
    loading: false,
    message: 'No data',
};

export const sidebarSeed: ISidebarProps = {
    collapsed: false,
    isOpen: false,
    subroutes: [],
    inroutes: [],
};

export const toastSeed: IToastState = {
    type: 'success',
    show: false,
    message: '',
    title: 'Notice',
    position: 'top-right',
};
