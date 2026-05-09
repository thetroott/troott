export interface SocialState {
    followingIds: string[];
    followerIds: string[];
    friendsActivityIds: string[];
    blockedUserIds: string[];
    collaborativePlaylistIds: string[];
}

export type SocialAction = { type: string; payload?: unknown };
