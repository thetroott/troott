import { IAPIKey, IUserCountry, IUserPermission } from "../utils/interfaces.util";
import Assessment from "./Assessment.model";
import Business from "./Business.model";
import Career from "./Career.model";
import Field from "./Field.model";
import Group from "./Group.model";
import Skill from "./Skill.model";
import Subscription from "./Subscription.model";
import Task from "./Task.model";
import User from "./User.model";

interface Talent {

    code: string,
    username: string,
    firstName: string,
    lastName: string,
    avatar: string,
    middleName: string,
    email: string,
    gender: string,
    slug: string,
    onboarding: {
        step: number,
        status: string,
    }
    phoneNumber: string,
    phoneCode: string,
    countryPhone: string
    country: IUserCountry,
    homeCountry: IUserCountry,

    // relationships
    user: User | any
    settings: string | any,
    subscription: Subscription | any,
    assessments: Array<Assessment | any>
    skills: Array<Skill | any>
    fields: Array<Field | any>
    pursuits: Array<Career | any>

    careers: Array<ITalentCareer>
    groups: Array<ITalentGroup>
    tasks: Array<ITaskStatus>
    badges: Array<ITalentBadge>

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: any;
    id: any;

}

export interface ITalentCareer {
    career: Career | any,
    fields: Array<Field | any>,
    level: string,
    currentLevel: string,
    skills: Array<Field | any>,
    assessments: number
    tasks: number
    projects: number
    sessions: number
    points: number,
    timeline: Array<ICareerTimeline>
    badges: Array<ITalentBadge>
}

export interface ITalentGroup {
    talent: Talent | any,
    business: Business | any,
    group: Group | any
}

export interface ICareerTimeline {
    position: number
    level: string,
    duration: number,
    handle: string,
    isActive: boolean
}

export interface ITaskStatus {
    id: Task | any,
    status: string
}

export interface ITalentBadge {
    name: string,
    logo: string,
    career: string,
    field: string
}

export interface ITalentPeer {
    avatar: string,
    assessments: number,
    tasks: number,
    projects: number,
    sessions: number,
    fields: Array<Field | any>,
    level: string,
    firstName: string,
    lastName: string,
    skills: Array<Skill | any>
    points: number,
    username: string,
}

export interface IGrowthData {
    percent: number,
    level: string,
    week: number
    data: Array<{
        name: string,
        value: number,
        plot: number
    }>
}

export interface ITalentGrowth {
    main: IGrowthData,
    timeline: Array<ICareerTimeline>,
    badges: Array<ITalentBadge>,
    points: number,
    wallet: number,
    rubrics: Array<{
        name: string,
        total: number,
        percent: number
    }>,
    completions: Array<{
        name: string,
        percent: number
    }>,
    peers: Array<ITalentPeer>
}

export default Talent;