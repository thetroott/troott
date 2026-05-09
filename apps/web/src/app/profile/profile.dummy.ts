import { UserType, type MinisterProfile } from './profile.types';

/**
 * Static profile used until `GET /profile/me` is wired in production.
 * Toggle real API with `VITE_PROFILE_USE_REAL_API=true` in `.env`.
 */
export const DUMMY_MINISTER_PROFILE: MinisterProfile = {
    id: 'dummy-profile-sam-adeyemi',
    userType: UserType.MINISTER,
    firstName: 'Sam',
    lastName: 'Adeyemi',
    email: 'pastorsamadeyemi@daystarchristiancentre.ng',
    slug: 'thesamadeyemi',
    avatar: null,
    coverImage: null,
    ministerialName: 'Pastor Sam Adeyemi',
    ministryName: 'Daystar Christian Centre',
    ministryHQLocation:
        'Plot A3C, Ikosi Road, Oregun, Ikeja, Lagos',
    ministryWebsite: 'https://daystarng.org',
    bio:
        "Sam Adeyemi (born February 3, 1967) is a Nigerian pastor, author, leadership consultant, and motivational speaker. He is the founder and Senior Pastor of Daystar Christian Centre, one of Nigeria's largest and most influential churches, headquartered in Lagos. Adeyemi is widely recognized for his practical teachings on success, leadership, financial management, and personal development, helping people integrate biblical principles into everyday life.\n\nBeyond the pulpit, he founded Success Power International and the Daystar Leadership Academy, through which he trains individuals and organizations in leadership and personal development. His books and teachings continue to inspire audiences around the world.",
    socials: {
        instagram: '@thesamadeyemi',
        twitter: '@sam_adeyemi',
        tiktok: 'samadeyemi',
    },
    createdAt: new Date('2023-03-01T12:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-05-01T12:00:00.000Z').toISOString(),
};
