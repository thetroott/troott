import Career from "./Career.model";
import Field from "./Field.model";
import Question from "./Question.model";
import Topic from "./Topic.model";
import User from "./User.model";

interface Skill {
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
    fields: Array<Field | any>,
    questions: Array<Question | any>,
    topics: Array<Topic | any>

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export default Skill