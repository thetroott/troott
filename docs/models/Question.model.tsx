import { DifficultyType, LevelType, QuestionType } from "../utils/types.util"
import Career from "./Career.model"
import Field from "./Field.model"
import Skill from "./Skill.model"
import Topic from "./Topic.model"
import User from "./User.model"

export interface IQuestionScore {
    cutoff: number,
    default: number,
    bonus: number
}

export interface IQuestionAnswer {
    code: string,
    alphabet: string,
    label: string,
    body: string,
    images: Array<string>,
    isCorrect: boolean
}

export interface IQuestionTime {
    duration: number,
    handle: string
}

export interface IQuestionCount {
    career: {
        _id: string,
        name: string
    },
    field: {
        _id: string,
        name: string
    },
    skill?: {
        _id: string,
        name: string
    }
    topic?: {
        _id: string,
        name: string
    }
    levels: Array<any>
}

interface Question {
    code: string,
    body: string,
    slug: string,
    time: IQuestionTime,
    isEnabled: boolean,
    difficulties: Array<DifficultyType>,
    levels: Array<LevelType>,
    types: Array<QuestionType>,
    score: IQuestionScore,

    // object properties
    answers: Array<IQuestionAnswer>

    // relationships
    createdBy: User | any,
    topics: Array<Topic | any>,
    career: Career | any,
    fields: Array<Field | any>,
    skills: Array<Skill | any>

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export default Question