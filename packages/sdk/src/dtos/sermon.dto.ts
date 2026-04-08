
import User from '@/dtos/user.dto';

export interface Sermon {
    code: string;
    name: string;
    description: string;
    index: number;

    createdBy: User; // owner of Sermon

   
    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: any;
    id: any;
}

export interface CreateSermonDTO {
  name: string;
  description: string;
  index?: number;
  createdBy?: string;
  user?: User;
}

export interface UpdateSermonDTO extends CreateSermonDTO {
  id: string;
}


export interface GetSermonDTO {
  id: string;

}

/** Workspace API payloads (historically mixed into sermon DTO file). */
export interface CreateWorkspaceDTO {
  name: string;
  description?: string;
  index?: number;
  createdBy?: string;
}

export interface GetWorkspaceDTO {
  id: string;
}

export interface UpdateWorkspaceDTO extends CreateWorkspaceDTO {
  id: string;
}

export type Workspace = Sermon;

export default Sermon;
