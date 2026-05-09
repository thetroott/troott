import Task from "./Task.model";
import User from "./User.model";

interface Comment {
     code: string,
    resource: string,
    message: string,
    slug: string,
    isEnabled: boolean

    // relationships
    reactions: Array<{
        user: User | any,
        message: string
    }>
    parent: Comment | any,
    author: User | any,
    replies: Array<Comment | any>,
    task: Task | any,

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default Comment;