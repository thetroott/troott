import Hackathon from '@/dtos/hackathon.dto';
import Project from '@/dtos/project.dto';
import User from '@/dtos/user.dto';
import Guest from '@/dtos/guest.dto';
interface Workspace {
    code: string;
    name: string;
    description: string;
    index: number;
    createdBy: User;
    members: Array<User>;
    invites: Array<User>;
    hackathons: Array<Hackathon>;
    projects: Array<Project>;
    mentors: Array<Guest>;
    judges: Array<Guest>;
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: any;
    id: any;
}
export interface CreateWorkspaceDTO {
    name: string;
    description: string;
    index?: number;
    createdBy?: string;
    user?: User;
}
export interface UpdateWorkspaceDTO extends CreateWorkspaceDTO {
    id: string;
}
export interface GetWorkspaceDTO {
    id: string;
}
export default Workspace;
//# sourceMappingURL=workspace.dto.d.ts.map