import Admin from "@/api/users/admin/admin.dto"
import Business from "@/dtos/business.dto"
import Entry from "@/dtos/entry.dto"
import Form, { IBlock, IQuestion, IResponse } from "@/dtos/form.dto"
import Hackathon from "@/dtos/hackathon.dto"
import Plan from "@/api/payments/plan.dto"
import Project from "@/dtos/project.dto"
import Squad from "@/dtos/squad.dto"
import Submission from "@/api/payments/submission.dto"
import Subscription from "@/dtos/subscription"
import Talent from "@/dtos/talent.dto"
import Task from "@/dtos/task.dto"
import Team from "@/dtos/team.dto"
import Transaction from "@/api/payments/transaction.dto"
import User from "@/dtos/user.dto"
import Workspace from "@/dtos/sermon.dto"
import { IAPIReport, IPagination, ISetLoading, ISidebarProps, IToastState, IUnsetLoading } from "@/utils/interfaces"
import { RefineType } from "@/utils/types"

export interface IClearResource {
    type: string,
    resource: 'multiple' | 'single'
}

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
    setResource(type: string, data: any): void
    setLoading(data: ISetLoading): void,
    unsetLoading(data: IUnsetLoading): void,
}

export interface IAppContext {

    talent: Talent,
    business: Business,
    admin: Admin,

    hackathon: Hackathon,
    entry: Entry,
    submission: Submission,
    squad: Squad

    project: Project,
    team: Team,
    task: Task,

    plans: ICollection,
    plan: Plan,
    transactions: ICollection,
    transaction: Transaction,
    
    search: ICollection,
    items: Array<any>

    workspaces: ICollection,
    workspace: Workspace,

    core: ICoreResource,
    hackCore: IHackDomain,
    projectCore: IProjectDomain,
    message: string,
    loading: boolean,
    loader: boolean,
    clearResource(data: IClearResource): void,
    setCollection(type: string, data: ICollection): void,
    setResource(type: string, data: any): void
    setLoading(data: ISetLoading): void,
    unsetLoading(data: IUnsetLoading): void,
}