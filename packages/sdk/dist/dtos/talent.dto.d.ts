import Entry from '@/dtos/entry.dto';
import Hackathon from '@/dtos/hackathon.dto';
import Project from '@/dtos/project.dto';
import Squad from '@/dtos/squad.dto';
import Submission from '@/dtos/submission.dto';
import Subscription from '@/dtos/subscription';
import Task from '@/dtos/task.dto';
import Team from '@/dtos/team.dto';
import Template from '@/dtos/template.dto';
import Transaction from '@/dtos/transaction.dto';
import User from '@/dtos/user.dto';
import Workspace from '@/dtos/workspace.dto';
interface Talent {
    code: string;
    firstName: string;
    lastName: string;
    slug: string;
    email: string;
    specialties: Array<string>;
    intrests: Array<string>;
    skils: Array<string>;
    bio: string;
    gender: string;
    dateOfBirth: string;
    occupation: string;
    employment: {
        company: string;
        position: string;
        startDate: Date;
    };
    education: {
        institution: string;
        type: string;
        degree: string;
        fieldOfStudy: string;
        startDate: Date;
        endDate: Date;
    };
    socials: Array<ISocials | any>;
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
}
interface ISocials {
    name: string;
    url: string;
    username: string;
}
export default Talent;
//# sourceMappingURL=talent.dto.d.ts.map