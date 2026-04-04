import { CSSProperties, MouseEvent, ReactNode } from 'react';
import {
    ListUIType,
    LoadingType,
    PagesearchType,
    PositionType,
    QueryOrderType,
    RefineType,
    ResourceType,
    RouteActionType,
    RouteParamType,
    SemanticType,
    SizeType,
    StatusType,
} from './types';
import Project from '@/dtos/project.dto';
import Task from '@/dtos/task.dto';
import Team from '@/dtos/team.dto';
import Squad from '@/dtos/squad.dto';
import Submission from '@/dtos/submission.dto';
import Entry from '@/dtos/entry.dto';
import Hackathon from '@/dtos/hackathon.dto';
import Form, { IBlock, IQuestion, IResponse } from '@/dtos/form.dto';

export interface IApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
            detail?: string;
            errors?: Array<string>;
        };
        headers?: Record<string, string>;
    };
    code?: string;
    message?: string;
}

export interface IResult {
    [x: string]: any;
    error: boolean;
    message: string;
    code: number;
    data: any;
}

export interface IRouteParam {
    type: RouteParamType;
    name: string;
    value?: string;
}

export interface IRouteItem {
    name: string;
    title?: string;
    displayTitle?: string;
    url: string;
    redirect?: string;
    isAuth: boolean;
    iconName?: string;
    action?: RouteActionType;
    content: {
        backButton?: boolean;
        collapsed?: boolean;
    };
    params?: Array<IRouteParam>;
}

export interface IInRoute extends IRouteItem {
    route: string;
    parent: string;
}

export interface IRoute extends IRouteItem {
    subroutes?: Array<IRouteItem>;
    inroutes?: Array<IInRoute>;
}

export interface ISidebar {
    pageTitle: string;
    collapsed: boolean;
}

export interface ISidebarProps {
    collapsed: boolean;
    route: IRouteItem;
    inroutes?: Array<IInRoute>;
    subroutes: Array<IRouteItem>;
    isOpen: boolean;
}

export interface ITopbar {
    pageTitle: string;
    sticky?: boolean;
    showBack: boolean;
}

export interface IToast {
    show: boolean;
    title?: string;
    message: string;
    type: SemanticType;
    position: PositionType;
    close(e?: MouseEvent<HTMLAnchorElement>): void;
}

export interface IAPIReport {
    format: string;
    csv?: string;
    xml?: any;
    pdf?: any;
}

export interface IListUI {
    type: ListUIType;
    resource?: ResourceType;
    resourceId?: string;
    subsource?: ResourceType;
    headers?: Array<{ label: string; style?: CSSProperties }>;
    rows?: Array<IListUIRow>;
}

export interface IListUIRow {
    option: 'status' | 'data';
    resource: ResourceType;
    type?: StatusType;
    data: any;
    callback?(data: any): void;
}

export interface ISetLoading {
    option: LoadingType;
    type?: string;
}

export interface IUnsetLoading {
    option: LoadingType;
    type?: string;
    message: string;
}

export interface IFileUpload {
    raw: any;
    base64: string;
    parsedSize: number;
    name: string;
    size: number;
    type: string;
    dur: number;
}

export interface IEmptyState {
    children: any;
    bgColor?: string;
    size: SizeType;
    className?: string;
    bound?: boolean;
}
export interface ITableHead {
    className?: string;
    items: Array<ICellHead>;
}
export interface ICellHead {
    fontSize?: number;
    className?: string;
    label: string;
    style?: CSSProperties;
}
export interface ICellData {
    fontSize?: number;
    className?: string;
    large?: boolean;
    style?: CSSProperties;
    children: ReactNode;
    onClick?(e: MouseEvent<any>): void;
}


export interface IUserPermission {
  entity: string,
  actions: Array<string>
}

export interface IAPIKey {
  secret: string,
  public: string,
  token: string,
  publicToken: string,
  domain: string,
  isActive: boolean,
  updatedAt: string
}

export interface IToastState {
  show: boolean,
  title?: string,
  error?: string,
  message: string,
  type: SemanticType,
  position: PositionType
}


export interface IPagination {
    next: { page: number; limit: number };
    prev: { page: number; limit: number };
}


export interface IDivider {
    show?: boolean,
    bg?: string,
    padding?: {
        enable?: boolean,
        top?: string,
        bottom?: string
    }
}

export interface IPlaceholder {
    className: string,
    height: string,
    bgColor: string,
    width: string,
    minWidth: string,
    minHeight: string,
    animate: boolean,
    radius: string | number,
    marginTop: string
    marginBottom: string,
    top: string
    left: string
    right: string,
    flex: boolean
}

export interface IPageSearch {
    key: string,
    hasResult: boolean,
    refine?: RefineType,
    payload?: any,
    type: PagesearchType,
    filters?: any,
    resource?: ResourceType,
    resourceId?: string
}


export interface IAppMetrics {
    loading: boolean,
    message: string,
    type: ResourceType,
    resource?: ResourceType,
    question?: {
        total: number,
        enabled: number,
        disabled: number,
        resource: {
            total: number,
            enabled: number,
            disabled: number,
        }
    }
}

export interface IListQuery {
    limit?: number,
    paginate?: string,
    page?: number,
    select?: string,
    order?: QueryOrderType,
    type?: string,
    admin?: boolean,
    mapped?: boolean,
    from?: string,
    to?: string,
    resource?: ResourceType,
    resourceId?: string,
    key?: string,
    payload?: any,
    report?: boolean
}



export interface IRoutil {
    computeAppRoute(route: IRoute): string,
    computePath(route: string): string,
    computeSubPath(route: IRoute, subroute: IRouteItem): string,
    computeInPath(inroute: IInRoute): string,
    inRoute(payload: { route: string, name: string, params?: Array<IRouteParam> }): string,
    resolveRouteParams(params: Array<IRouteParam>, stickTo: 'app' | 'page'): string
}


export interface IStorage {
    storeAuth(token: string, id: string, userType: string, email: string, businessType?: string): void;
    checkToken(): boolean;
    getToken(): string | null;
    checkUserID(): boolean;
    getUserID(): string;
    checkUserType(): boolean;
    getUserType(): string | null;
    checkUserEmail(): boolean;
    getUserEmail(): string | null;
    checkBusinessType(): boolean;
    getBusinessType(): string | null;

    getConfig(): any;
    getConfigWithBearer(): any;
    clearAuth(): void;
    keep(key: string, data: any): boolean;
    keepLegacy(key: string, data: any): boolean;
    fetch(key: string): any;
    fetchLegacy(key: string): any;
    deleteItem(key: string, legacy?: boolean): boolean;
    trimSpace(str: string): string;
    copyCode(code: string): boolean;
    debugAuth(): any;
}

