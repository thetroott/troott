import { IAPIKey, IUserPermission } from "../utils/interfaces.util";
import { DifficultyType, LevelType } from "../utils/types.util";
import Business from "./Business.model";
import Career from "./Career.model";
import Comment from "./Comment.model";
import Field from "./Field.model";
import Question from "./Question.model";
import Skill from "./Skill.model";
import Talent from "./Talent.model";
import Topic from "./Topic.model";
import User from "./User.model";

interface Task {

    code: string,
    type: string,
    image: string,
    title: string,
    description: string,
    objectives: Array<ITaskObjective>,
    instructions: Array<ITaskInstruction>,
    resources: Array<ITaskResource>,
    deliverables: Array<ITaskDeliverable>,
    requirements: Array<string>,
    outcomes: Array<string>
    status: string,
    level: string,
    difficulty: string,
    duration: {
        value: number,
        handle: string,
        label: string
    },
    startDate: {
        date: string,
        ISO: string
    },
    dueDate: {
        date: string,
        ISO: string
    },
    submission: {
        notes: any,
        guidelines: Array<string>
        essay: string,
        items: Array<ITaskSubmissionItem>,
    },
    error: ITaskError
    feedbacks: Array<ITaskFeedback>,
    review: ITaskReview,
    rubrics: Array<ITaskRubric>
    isEnabled: boolean,
    isSubmitted: boolean,
    slug: string,

    // relationships
    career: Career | any,
    field: Field | any,
    topic: Topic | any,
    mentor: User | any,
    assignedTo: Talent | any,
    assignedBy: User | any,
    revokedBy: User | any,
    createdBy: User | any,
    submittedBy: User | any,
    business: Business | any,
    skills: Array<Skill | any>,
    comments: Array<Comment | any>,
    talents: Array<Talent | any>,
    template: Task | any,
    children: Array<Task | any>,

    // time stamps
    startedAt: string | null
    submittedAt: string | null
    assignedAt: string | null;
    revokedAt: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;

}

export interface ITaskError {
    message: string,
    provider: string,
    code: string | number,
    stack: any;
}

export interface ITaskReview {
    essay: string,
    evals: Array<ITaskEval>
    grade: {
        code: string,
        description: string
    },
}

export interface ITaskEval {
    criteria: string,
    notes: string,
    score: number
}

export interface ITaskRubric {
    code: string,
    criteria: string,
    description: string,
    point: number
}

export interface ITaskFeedback {
    user: User | any,
    body: string,
    improvements: Array<string>
}

export interface ITaskSubmissionItem {
    name: string,
    url: string,
    description: string
}

export interface ITaskDeliverable {
    code: string,
    title: string,
    outcomes: Array<string>
}

export interface ITaskResource {
    name: string,
    code: string,
    title: string,
    description: string,
    url: string,
}

export interface ITaskObjective {
    code: string,
    title: string,
    steps: Array<string>
}

export interface ITaskInstruction {
    code: string,
    title: string,
    actions: Array<string>
}

export default Task;