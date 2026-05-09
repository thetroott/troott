import Career from "./Career.model";
import Question from "./Question.model";
import User from "./User.model";

export interface Field {
    code: string,
    name: string,
    label: string,
    description: string,
    slug: string,
    isEnabled: boolean

    // object properties

    // relationships
    createdBy: User | any,
    career: Career | any,
    skills: Array<string | any>,
    questions: Array<Question | any>,
    topics: Array<string | any>

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export default Field