import { DotIcon } from 'lucide-react';
import { getStoredStudioCode } from '@/utils/studio-nav.util';
import {
    PATH_GET_STARTED,
    PATH_SEG_SERMONS_UPLOAD,
    PATH_SEG_SERMONS_UPLOAD_DETAILS,
    PATH_SEG_SERMONS_UPLOAD_FILE,
    PATH_SEG_SERMONS_UPLOAD_PUBLISH,
    PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
    PATH_STUDIO_PREFIX,
} from '@/routes/paths';

function studioPath(segment: string): string {
    const code = getStoredStudioCode();
    if (!code) {
        return `${PATH_STUDIO_PREFIX}/_/${segment}`;
    }
    return `${PATH_STUDIO_PREFIX}/${code}/${segment}`;
}

const OnboardingItems = [
    {
        id: '1',
        icon: DotIcon,
        title: 'Verify your account',
        text: 'Add the required information to verify your account and avoid any interruptions to your access or sermon publishing.',
        button: 'Verify account',
        action: `${PATH_GET_STARTED}/verify-account`,
        steps: [
            {
                id: '1',
                title: 'Personal Information',
                action: `${PATH_GET_STARTED}/verify-account/personal-information`,
            },
            {
                id: '2',
                title: 'Document Verification',
                action: `${PATH_GET_STARTED}/verify-account/verify-document`,
            },
            {
                id: '3',
                title: 'Document tips',
                action: `${PATH_GET_STARTED}/verify-account/verify-document/select`,
            },
            {
                id: '4',
                title: 'Upload method',
                action: `${PATH_GET_STARTED}/verify-account/verify-document/document1`,
            },
            {
                id: '5',
                title: 'Document Verification',
                action: `${PATH_GET_STARTED}/verify-account/verify-document/upload`,
            },
        ],
    },
    {
        id: '2',
        icon: DotIcon,
        title: 'Complete your profile',
        text: 'Fill out your home address and ministry information so listeners can connect with you.',
        button: 'Complete profile',
        action: `${PATH_GET_STARTED}/home-address`,
        steps: [
            {
                id: '1',
                title: 'Home address',
                action: `${PATH_GET_STARTED}/home-address`,
            },
            {
                id: '2',
                title: 'Ministry profile',
                action: `${PATH_GET_STARTED}/ministry-input`,
            },
        ],
    },
    {
        id: '3',
        icon: DotIcon,
        title: 'How to use troott',
        text: 'Take a guided tour of the dashboard using Troott. It helps you discover important tools and how to use them effectively.',
        button: 'Tour & Tutorial',
        action: `${PATH_GET_STARTED}/tour-guide`,
        steps: [
            {
                id: '1',
                title: 'Tour',
                action: `${PATH_GET_STARTED}/tour-guide`,
            },
        ],
    },
    {
        id: '4',
        icon: DotIcon,
        title: 'Upload first sermon',
        text: 'Create your first sermon post with title, description, and upload your audio or video content.',
        button: 'Upload sermon',
        action: studioPath(PATH_SEG_SERMONS_UPLOAD),
        steps: [
            {
                id: '1',
                title: 'Upload File',
                action: studioPath(PATH_SEG_SERMONS_UPLOAD_FILE),
            },
            {
                id: '2',
                title: 'Sermon Details',
                action: studioPath(PATH_SEG_SERMONS_UPLOAD_DETAILS),
            },
            {
                id: '3',
                title: 'Thumbnail & Preview',
                action: studioPath(PATH_SEG_SERMONS_UPLOAD_THUMBNAIL),
            },
            {
                id: '4',
                title: 'Publish Settings',
                action: studioPath(PATH_SEG_SERMONS_UPLOAD_PUBLISH),
            },
        ],
    },
];

export default OnboardingItems;
