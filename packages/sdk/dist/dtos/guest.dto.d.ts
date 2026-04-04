import User from '@/dtos/user.dto';
interface Guest {
    code: string;
    firstName: string;
    lastName: string;
    slug: string;
    email: string;
    bio: string;
    jobTitle: string;
    organization: string;
    areasOfExpertise: Array<string>;
    yearsOfExperience: string;
    socials: Array<ISocials | any>;
    image: {
        fileName: string;
        s3Key: string;
    };
    type: GuestType;
    visibility: GuestVisibility;
    status: GuestStatus;
    inviteStatus: GuestInviteStatus;
    mentorType?: MentorContextType;
    invitedBy: User | any;
    settings: {};
    user: User | any;
    hackathons: Array<any>;
    entries: Array<any>;
    projects: Array<any>;
    workspace: Array<any>;
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: any;
    id: any;
}
export declare enum GuestType {
    MENTOR = "mentor",
    JUDGE = "judge",
    GUEST = "guest"
}
export declare enum MentorContextType {
    ENTRY = "entry",
    SUBMISSION = "submission",
    PROJECT = "project",
    HACKATHON = "hackathon"
}
export interface ISocials {
    name: string;
    url: string;
    username: string;
}
export declare enum GuestVisibility {
    PUBLIC = "public",
    PRIVATE = "private"
}
export declare enum GuestStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare enum GuestInviteStatus {
    PENDING = "pending",
    ACTIVE = "active"
}
export default Guest;
//# sourceMappingURL=guest.dto.d.ts.map