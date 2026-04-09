import { FileType, UploadStatus } from '../../../utils/enums.util';
import { IFile } from '../../../utils/interfaces.util';
import { GuestStatusEnum, GuestVisibiltyEnum, GuestTypeEnum, MentorContextType } from './guest.interface';

export interface IGuestImage {
    fileName: string;
    fileSize: number;
    fileType: FileType;
    mimetype: string;
    uploadedBy: string;
    uploadStatus: UploadStatus;
    uploadId: string;
    s3Key: string;
    rawFile: string;
}

export interface CreateGuestDTO {
    firstName: string;
    lastName: string;
    email: string;
    type: GuestTypeEnum; // MENTOR, JUDGE, or GUEST
    status?: GuestStatusEnum;
    visibility?: GuestVisibiltyEnum;
    guestImage?: IFile;
    jobTitle?: string;
    organization?: string;
    bio?: string;
    areasOfExpertise?: string[];
    yearsOfExperience?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    website?: string;
    mentorType?: MentorContextType; // Only relevant when type is MENTOR
    hackathonId?: string;
    workspaceId?: string;
    projectId?: string;
    orgId: string; // would be during requesting handling
    invitedBy: string; // User who is inviting
}

export interface UpdateGuestDTO {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    organization?: string;
    bio?: string;
    areasOfExpertise?: string[];
    yearsOfExperience?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    website?: string;
    status?: GuestStatusEnum;
    visibility?: GuestVisibiltyEnum;
    mentorType?: MentorContextType; // Only relevant when type is MENTOR
    guestImage?: IFile;
}

export interface GuestInviteDTO {
    email: string;
    type: GuestTypeEnum; // MENTOR or JUDGE
    mentorType?: MentorContextType; // Optional, only for MENTOR type
    hackathonId?: string;
    workspaceId?: string;
    projectId?: string;
    invitedBy: string;
}

export interface AddGuestToWorkspaceDTO {
    workspaceId: string;
    guestId: string;
    requestingUser: string;
}

export interface RemoveGuestFromWorkspaceDTO {
    workspaceId: string;
    guestId: string;
    requestingUser: string;
}

export interface AddGuestToHackathonDTO {
    hackathonId: string;
    guestId: string;
    requestingUser: string;
}

export interface RemoveGuestFromHackathonDTO {
    hackathonId: string;
    guestId: string;
    requestingUser: string;
}
