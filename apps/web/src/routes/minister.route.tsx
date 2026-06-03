import { Navigate } from 'react-router-dom';
import GetStarted from '@/app/get-started/GetStarted';
import GetVerified from '@/app/account/GetVerified';
import VerifyUserInfo from '@/app/account/VerifyUserInfo';
import VerifyDocument from '@/app/account/VerifyDocument';
import HomeAddressInfo from '@/app/account/HomeAddressInfo';
import MinistryInfo from '@/app/account/MinistryInfo';
import TourGuidePage from '@/app/get-started/TourGuidePage';
import SettingsPage from '@/app/settings/SettingsPage';
import UserProfile from '@/app/profile/UserProfile';
import InnerLayout from '@/components/layouts/InnerLayout';
import SelectDocumentType from '@/components/shared/get-started/SelectDocumentType';
import VerifyDocument1 from '@/components/shared/get-started/verify-document1';
import VerifyDocumentForm from '@/components/shared/get-started/verify-document';
import UploadDocumentWrapper from '@/components/shared/upload/UploadDocumentWrapper';
import GetStartedOnboardingGate from '@/components/shared/get-started/GetStartedOnboardingGate';
import { IRoute } from '@/utils/interfaces';
import {
    PATH_GET_STARTED,
    PATH_PROFILE,
    PATH_SETTINGS,
    PATH_SEG_GET_STARTED_HOME_ADDRESS,
    PATH_SEG_GET_STARTED_MINISTRY,
    PATH_SEG_GET_STARTED_TOUR,
    PATH_SEG_GET_STARTED_VERIFY_ACCOUNT,
    PATH_SEG_GET_STARTED_VERIFY_DOCUMENT,
    PATH_SEG_GET_STARTED_VERIFY_PERSONAL,
} from './paths';

/** Minister onboarding + shared profile (nested under dashboard layout). */
const ministerRoutes: Array<IRoute> = [
    {
        name: 'get-started',
        url: PATH_GET_STARTED,
        isAuth: true,
        path: 'get-started',
        element: <GetStartedOnboardingGate />,
        subroutes: [
            {
                name: 'get-started-index',
                url: PATH_GET_STARTED,
                isAuth: true,
                index: true,
                element: <GetStarted />,
            },
            {
                name: 'get-started-inner',
                url: PATH_GET_STARTED,
                isAuth: true,
                element: <InnerLayout />,
                subroutes: [
                    {
                        name: 'verify-account',
                        url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_ACCOUNT}`,
                        isAuth: true,
                        path: PATH_SEG_GET_STARTED_VERIFY_ACCOUNT,
                        element: <GetVerified />,
                    },
                    {
                        name: 'verify-personal',
                        url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_PERSONAL}`,
                        isAuth: true,
                        path: PATH_SEG_GET_STARTED_VERIFY_PERSONAL,
                        element: <VerifyUserInfo />,
                    },
                    {
                        name: 'verify-document',
                        url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOCUMENT}`,
                        isAuth: true,
                        path: PATH_SEG_GET_STARTED_VERIFY_DOCUMENT,
                        element: <VerifyDocument />,
                        subroutes: [
                            {
                                name: 'verify-document-index',
                                url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOCUMENT}`,
                                isAuth: true,
                                index: true,
                                element: <SelectDocumentType />,
                            },
                            {
                                name: 'document1',
                                url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOCUMENT}/document1`,
                                isAuth: true,
                                path: 'document1',
                                element: <VerifyDocument1 />,
                            },
                            {
                                name: 'select',
                                url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOCUMENT}/select`,
                                isAuth: true,
                                path: 'select',
                                element: <VerifyDocumentForm />,
                            },
                            {
                                name: 'upload',
                                url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOCUMENT}/upload`,
                                isAuth: true,
                                path: 'upload',
                                element: <UploadDocumentWrapper />,
                            },
                        ],
                    },
                    {
                        name: 'complete-profile',
                        url: `${PATH_GET_STARTED}/complete-profile`,
                        isAuth: true,
                        path: 'complete-profile',
                        element: (
                            <Navigate
                                to={`${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_HOME_ADDRESS}`}
                                replace
                            />
                        ),
                    },
                    {
                        name: 'home-address',
                        url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_HOME_ADDRESS}`,
                        isAuth: true,
                        path: PATH_SEG_GET_STARTED_HOME_ADDRESS,
                        element: <HomeAddressInfo />,
                    },
                    {
                        name: 'ministry-input',
                        url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_MINISTRY}`,
                        isAuth: true,
                        path: PATH_SEG_GET_STARTED_MINISTRY,
                        element: <MinistryInfo />,
                    },
                    {
                        name: 'tour-guide',
                        url: `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_TOUR}`,
                        isAuth: true,
                        path: PATH_SEG_GET_STARTED_TOUR,
                        element: <TourGuidePage />,
                    },
                ],
            },
        ],
    },
    {
        name: 'settings',
        url: PATH_SETTINGS,
        isAuth: true,
        path: 'settings',
        element: <SettingsPage />,
    },
    {
        name: 'profile',
        url: PATH_PROFILE,
        isAuth: true,
        path: 'profile',
        element: <UserProfile />,
    },
];

export default ministerRoutes;
