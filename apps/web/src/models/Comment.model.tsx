export interface CommentAuthor {
    id: string;
    name: string;
    avatar?: string;
}

export interface Comment {
    id: string;
    code: string;
    message: string;
    isEnabled: boolean;
    author: CommentAuthor;
    reactionsCount: number;
    repliesCount: number;
    replies?: Comment[];
    mediaItemId: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

export default Comment;
