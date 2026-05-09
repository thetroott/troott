import Business from "./Business.model"
import { Library } from "./Library.model"
import { Module } from "./Module.model"
import Talent from "./Talent.model"
import User from "./User.model"

export interface Lesson{
    code: string,
    banner: string,
    title: string,
    description: string,
    status: string,
    order: number,
    provider: string,
    url: string,
    embedUrl: string,
    talents: Array<Talent | any>,

    module: Module | any,
    library: Library | any,
    business: Business | any,
    createdBy: User | any,
    updatedBy: User | any,

    createdAt: string,
    updatedAt: string,
    _version: number,
    _id: string,
    id: string,
}