import Admin from "@/dtos/admin.dto";
import Entry from "@/dtos/entry.dto";
import Hackathon from "@/dtos/hackathon.dto";
import Project from "@/dtos/project.dto";
import Squad from "@/dtos/squad.dto";
import Submission from "@/dtos/submission.dto";
import Subscription from "@/dtos/subscription";
import Task from "@/dtos/task.dto";
import Team from "@/dtos/team.dto";
import Template from "@/dtos/template.dto";
import Transaction from "@/dtos/transaction.dto";
import User from "@/dtos/user.dto";
import Workspace from "@/dtos/workspace.dto";
interface Business {
    code: string;
    firstName: string;
    lastName: string;
    slug: string;
    email: string;
    businessName: string;
    businessType: string;
    description: string;
    size: string;
    industry: string;
    tags: Array<string>;
    website: string;
    socials: Array<ISocials | any>;
    verification: IVerification;
    registration: IBusinessRegistration;
    verifiedBy: Admin | any;
    isPublic: boolean;
    createdBy: User | any;
    settings: string | any;
    user: User | any;
    roles: Array<any>;
    workspaces: Array<Workspace | any>;
    subscription: Subscription | any;
    transactions: Array<Transaction | any>;
    templates: Array<Template | any>;
    hackathons: Array<Hackathon | any>;
    entries: Array<Entry | any>;
    submissions: Array<Submission | any>;
    squad: Array<Squad | any>;
    projects: Array<Project | any>;
    teams: Array<Team | any>;
    tasks: Array<Task | any>;
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: any;
    id: any;
}
interface ISocials {
    name: string;
    url: string;
    username: string;
}
interface IBusinessRegistration {
    RegisteredBusinessName: string;
    registrationNumber: string;
    registrationDate: Date;
    registrationCountry: string;
}
interface IVerification {
    status: string;
    verifiedBy: Admin | any;
    verifiedAt: Date;
    reason: string;
}
export default Business;
//# sourceMappingURL=business.dto.d.ts.map