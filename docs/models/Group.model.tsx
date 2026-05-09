import Assessment from "./Assessment.model";
import Business from "./Business.model";
import Career from "./Career.model";
import Field from "./Field.model";
import Talent from "./Talent.model";
import Task from "./Task.model";

export interface Group {

    code: string,
    name: string,
    description: string,
    type: string
    slug: string,
    isEnabled: boolean,
    isParent: boolean,

    business: Business | any,
    talent: Talent | any,
    leader: Talent | any,
    members: Array<Talent | any>
    field: Field | any,
    career: Career | any,
    assessments: Array<Assessment | any>
    tasks: Array<Task | any>
    projects: Array<any>
    parent: Group | any,
    subgroups: Array<Group | any>
    

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export default Group