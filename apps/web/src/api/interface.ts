import Admin from "@/dtos/admin.dto"
import Business from "@/dtos/business.dto"
import Entry from "@/dtos/entry.dto"
import Form, { IBlock, IQuestion, IResponse } from "@/dtos/form.dto"
import Hackathon from "@/dtos/hackathon.dto"
import Plan from "@/dtos/plan.dto"
import Project from "@/dtos/project.dto"
import Squad from "@/dtos/squad.dto"
import Submission from "@/dtos/submission.dto"
import Subscription from "@/dtos/subscription"
import Talent from "@/dtos/talent.dto"
import Task from "@/dtos/task.dto"
import Team from "@/dtos/team.dto"
import Transaction from "@/dtos/transaction.dto"
import User from "@/dtos/user.dto"
import Workspace from "@/dtos/workspace.dto"
import { IAPIReport, IPagination, ISetLoading, ISidebarProps, IToastState, IUnsetLoading } from "@/utils/interfaces"
import { RefineType } from "@/utils/types"

export type { IAppContext, IClearResource } from '@/context/app/types';

export interface ICollection {
    data: Array<any>,
    report?: IAPIReport
    count: number,
    total: number,
    pagination: IPagination,
    loading: boolean,
    refineType?: RefineType,
    message?: string,
    payload?: any

}  

export interface ICoreResource {
    forms: Array<Form>;
    blocks: Array<IBlock>;
    questions: Array<IQuestion>;
    responses: Array<IResponse>;
}

export interface IHackDomain {
    hackathons: Array<Hackathon>;
    entries: Array<Entry>;
    submissions: Array<Submission>;
    squad: Array<Squad>;
}

export interface IProjectDomain {
    projects: Array<Project>;
    Teams: Array<Team>;
    tasks: Array<Task>;

}
    
export interface IUserContext {
    users: ICollection,
    user: User,
    userType: string,
    businessType: string,

    talent: Talent,
    business: Business,
    admin: Admin,

    hackathon: Hackathon,
    entry: Entry,
    submission: Submission,
    squad: Squad,

    project: Project,
    team: Team,
    task: Task,


    subscription: Subscription,
    plan: Plan,
    
    loading: boolean,
    sidebar: ISidebarProps,
    toast: IToastState,
    setToast(data: IToastState): void,
    clearToast(): void,
    setSidebar(data: ISidebarProps): void,
    currentSidebar(collapse: boolean): ISidebarProps | null,
    setUserType(type: string): void,
    setBusinessType(type: string): void,
    setCollection(type: string, data: ICollection): void,
    setResource(type: string, data: any): void,
    setLoading(data: ISetLoading): void,
    unsetLoading(data: IUnsetLoading): void,
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
    setStudioCode(code: string): void;
    getStudioCode(): string;

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
