import Business from "./Business.model"
import { Lesson } from "./Lesson.model"
import { Library } from "./Library.model"
import User from "./User.model"

export interface Module{
    code: string,
    banner: string
    title: string,
    description: string,
    status: string,
    order: number,

    library: Library | any,
    business: Business | any,
    createdBy: User | any,
    updatedBy: User | any,
    lessons: Array<Lesson | any>

    createdAt: string,
    updatedAt: string,
    _version: number,
    _id: string,
    id: string,
}