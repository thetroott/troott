import Business from "./Business.model"
import { Module } from "./Module.model"
import User from "./User.model"

export interface Library{
    code: string,
    banner: string,
    title: string,
    description: string,
    status: string,
    slug: string,

    business: Business | any,
    createdBy: User | any,
    updatedBy: User | any,
    modules: Array<Module | any>
    lessons: Array<Module | any>

    createdAt: string,
    updatedAt: string,
    _version: number,
    _id: string,
    id: string,
}