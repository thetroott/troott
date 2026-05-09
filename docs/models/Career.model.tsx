import Field from "./Field.model";
import Industry from "./Industry.model";
import Question from "./Question.model";
import Skill from "./Skill.model";
import User from "./User.model";

export interface Career {
    code: string,
    name: string,
    label: string,
    synonyms: Array<string>,
    description: string,
    slug: string,
    isEnabled: boolean

    // object properties

    // relationships
    createdBy: User | any,
    industry: Industry | any,
    fields: Array<Field | any>
    skills: Array<Skill | any>,
    questions: Array<Question | any>

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export default Career;