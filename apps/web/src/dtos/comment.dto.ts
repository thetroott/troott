export interface CreateCommentDTO {
    message: string;
    mediaItemId: string;
    parentId?: string;
}

export interface UpdateCommentDTO {
    message: string;
}

export interface AddReactionDTO {
    message: string;
}

export interface CommentAuthorDTO {
    id: string;
    name: string;
    avatar?: string;
}

export interface CommentResponseDTO {
    id: string;
    code: string;
    message: string;
    isEnabled: boolean;
    author: CommentAuthorDTO;
    reactionsCount: number;
    repliesCount: number;
    replies?: Array<CommentResponseDTO>;
    mediaItemId: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
}
