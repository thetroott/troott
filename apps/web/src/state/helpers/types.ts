/**
 * Legacy action names that older app modules still import.
 * Kept as string literals while migration to `@troott/state` continues.
 */
type LegacyAppKey =
    | 'resource'
    | 'team'
    | 'leaderboard'
    | 'resources'
    | 'projects'
    | 'project';

export const GET_LOGGEDIN_USER: LegacyAppKey = 'resource';
export const GET_TALENT: LegacyAppKey = 'team';
export const GET_TALENTS: LegacyAppKey = 'leaderboard';
export const GET_USER: LegacyAppKey = 'resource';
export const GET_USERS: LegacyAppKey = 'resources';
/** Legacy setter alias — writes into `resources` collection state */
export const SET_ITEMS: LegacyAppKey = 'resources';

export const GET_WORKSPACES: LegacyAppKey = 'projects';
export const GET_WORKSPACE: LegacyAppKey = 'project';
export const SET_WORKSPACE: LegacyAppKey = 'project';
