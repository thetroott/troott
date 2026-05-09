export const URL_LOGIN = '/auth/login'
export const URL_REGISTER = '/auth/register'
export const URL_ACTIVATE = '/auth/activate'
export const URL_VERIFY_OTP = '/auth/verify-otp'
export const URL_FORGOT_PASSWORD = '/auth/forgot-password'
export const URL_RESET_PASSWORD = '/auth/reset-password'
export const URL_RESEND_OTP = '/auth/resend-otp'
export const URL_GET_TOKEN = '/auth/token'
export const URL_LOGOUT = '/auth/logout'
export const URL_LOGGEDIN_USER = '/auth/user'

export const URL_USERS = '/users'
export const URL_CHANGE_PASSWORD = `${URL_USERS}/update-password`

export const URL_LIBRARY = 'library'
export const URL_PLAYLIST = 'playlist'
export const URL_PLAYBACK = 'playback'

export const URL_LISTENER = '/listener'
export const URL_MINISTERS = '/ministers'
export const URL_MINISTER = '/minister'
export const URL_ADMIN = '/admin'
export const URL_TOPIC = '/topics'

export const URL_PLANS = `/plans`
export const URL_SUBSCRIPTIONS = `/subscriptions`
export const URL_TRANSACTION = `/transactions`
export const URL_STORAGE_UPLOAD = '/storage/upload'


export const P = {
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        verifyOtp: '/auth/verify-otp',
        resendOtp: '/auth/resend-otp',
        activate: '/auth/activate',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
        changePassword: '/auth/change-password',
        token: '/auth/token',
        logout: '/auth/logout',
    },
    roles: {
        list: '/roles/list',
        byId: (id: string) => `/roles/${id}`,
        userRoles: (userId: string) => `/roles/user/${userId}`,
        attach: (userId: string) => `/roles/user/${userId}/attach`,
        detach: (userId: string) => `/roles/user/${userId}/detach`,
        root: '/roles',
    },
    user: {
        me: '/user',
        list: '/user/list',
        deactivate: '/user/deactivate',
    },
    profile: {
        me: '/profile/me',
    },
    listener: {
        root: '/listener',
        list: '/listener/list',
        interests: '/listener/interests',
        invite: '/listener/invite',
        inviteBulk: '/listener/invite/bulk',
        inviteResend: '/listener/invite/resend',
        inviteAccept: '/listener/invite/accept',
        inviteRevoke: '/listener/invite/revoke',
        setPassword: '/listener/set-password',
    },
    minister: {
        root: '/minister',
        list: '/minister/list',
        verification: '/minister/verification',
        verificationStatus: '/minister/verification/status',
        invite: '/minister/invite',
        inviteBulk: '/minister/invite/bulk',
        inviteResend: '/minister/invite/resend',
        inviteAccept: '/minister/invite/accept',
        inviteRevoke: '/minister/invite/revoke',
        setPassword: '/minister/set-password',
    },
    creator: {
        root: '/creator',
        list: '/creator/list',
        byId: (id: string) => `/creator/${id}`,
        invite: '/creator/invite',
        inviteAccept: '/creator/invite/accept',
        inviteRevoke: '/creator/invite/revoke',
        setPassword: '/creator/set-password',
        verification: '/creator/verification',
        verificationStatus: '/creator/verification/status',
    },
    admin: {
        root: '/admin',
        list: '/admin/list',
        byId: (id: string) => `/admin/${id}`,
        invite: '/admin/invite',
        inviteAccept: '/admin/invite/accept',
        inviteRevoke: '/admin/invite/revoke',
        setPassword: '/admin/set-password',
    },
    sermon: {
        root: '/sermon',
        byId: (id: string) => `/sermon/${id}`,
        startUpload: '/sermon/start-upload',
        imageUpload: '/sermon/image-upload',
        publish: (id: string) => `/sermon/publish/${id}`,
        update: (id: string) => `/sermon/update/${id}`,
        moveToBin: (id: string) => `/sermon/move-to-bin/${id}`,
        delete: (id: string) => `/sermon/delete/${id}`,
        topic: (topic: string) => `/sermon/topic/${encodeURIComponent(topic)}`,
        minister: (ministerId: string) => `/sermon/minister/${ministerId}`,
        ministerMostPlayed: (ministerId: string) =>
            `/sermon/minister/${ministerId}/most-played`,
        ministerMostLiked: (ministerId: string) =>
            `/sermon/minister/${ministerId}/most-liked`,
        ministerMostShared: (ministerId: string) =>
            `/sermon/minister/${ministerId}/most-shared`,
        ministerRecentlyPublished: (ministerId: string) =>
            `/sermon/minister/${ministerId}/recently-published`,
        statsMostPlayed: '/sermon/stats/most-played',
        statsMostLiked: '/sermon/stats/most-liked',
        statsMostShared: '/sermon/stats/most-shared',
        statsRecentlyPublished: '/sermon/stats/recently-published',
        userRecentlyAdded: '/sermon/user/recently-added',
        userRecentlyPlayed: '/sermon/user/recently-played',
        userPopular: '/sermon/user/popular',
        userFavoriteMinisters: '/sermon/user/favorite-ministers',
        userInterests: '/sermon/user/interests',
    },
    library: {
        root: '/library',
        user: (userId: string) => `/library/user/${userId}`,
        userLibrary: (userId: string, libraryId: string) =>
            `/library/user/${userId}/${libraryId}`,
    },
    playlist: {
        root: '/playlist',
        user: (userId: string) => `/playlist/user/${userId}`,
        byId: (id: string) => `/playlist/${id}`,
        add: (playlistId: string) => `/playlist/${playlistId}/add`,
        remove: (playlistId: string) => `/playlist/${playlistId}/remove`,
    },
    preference: {
        root: '/preference',
        me: '/preference/me',
        byUser: (userId: string) => `/preference/${userId}`,
    },
    search: {
        root: '/search',
    },
    discovery: {
        home: '/discovery/home',
    },
    share: {
        resolve: '/share/resolve',
    },
    open: {
        sermon: (id: string) => `/open/sermon/${id}`,
    },
    playback: {
        root: '/playback',
        sermon: (sermonId: string) => `/playback/sermon/${sermonId}`,
    },
    notifications: {
        device: '/notifications/device',
    },
    storage: {
        upload: '/storage/upload',
    },
    invitation: {
        byId: (id: string) => `/invitation/id/${id}`,
        inviter: (inviterId: string) => `/invitation/inviter/${inviterId}`,
        invitee: '/invitation/invitee',
        resource: (resourceId: string) =>
            `/invitation/resource/${resourceId}`,
    },
    plans: {
        root: '/plans',
        byId: (planId: string) => `/plans/${planId}`,
    },
    subscriptions: {
        root: '/subscriptions',
    },
} as const;
