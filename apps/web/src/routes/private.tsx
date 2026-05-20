import DashboardLayout from '@/components/layouts/DashboardLayout';
import Home from '@/app/home/Home';
import Dashboard from '@/app/dashboard/Dashboard';
import GetStarted from '@/app/get-started/GetStarted';
import Sermons from '@/app/sermons/MySermons';
import Analytics from '@/app/analytics/Analytics';
import InnerLayout from '@/components/layouts/InnerLayout';
import UserAccount from '@/app/account/GetVerified';
import PersonalInfo from '@/app/account/VerifyUserInfo';
import VerifyDocument from '@/app/account/VerifyDocument';
import SelectDocumentType from '@/components/shared/get-started/SelectDocumentType';
import VerifyDocumentForm from '@/components/shared/get-started/verify-document';
import Bin from '@/app/bin/Bin';
import VerifyDocument1 from '@/components/shared/get-started/verify-document1';
import { UploadDocumentWrapper } from '@/components/shared/upload';
import HomeAddressPage from '@/app/account/HomeAddressInfo';
import MinistryInputPage from '@/app/account/MinistryInfo';
import UserProfile from '@/app/profile/UserProfile';
import ChangePassword from '@/app/auth/ChangePassword';
import TourGuidePage from '@/app/get-started/TourGuidePage';
import StudioPortal from '@/app/studio/StudioPortal';
import { Navigate } from 'react-router-dom';
import { INTERNAL_PORTAL_ROLES } from '@/utils/roles.util';

export const privateRoutes = [
    {
        path: '/',
        element: <Home />,
        roles: INTERNAL_PORTAL_ROLES,
    },
    {
        path: '',
        element: <DashboardLayout />,
        children: [
            // get-started landing page
            {
                path: 'get-started',
                element: <GetStarted />,
                roles: INTERNAL_PORTAL_ROLES,
            },

            // get-started sub routes using InnerLayout
            {
                path: 'get-started',
                element: <InnerLayout />,
                roles: INTERNAL_PORTAL_ROLES,
                children: [
                    { path: 'verify-account', element: <UserAccount /> },
                    {
                        path: 'verify-account/personal-information',
                        element: <PersonalInfo />,
                    },
                    {
                        path: 'verify-account/verify-document',
                        element: <VerifyDocument />,
                        children: [
                            {
                                index: true,
                                element: <SelectDocumentType />,
                            },
                            {
                                path: 'document1',
                                element: <VerifyDocument1 />,
                            },
                            {
                                path: 'select',
                                element: <VerifyDocumentForm />,
                            },
                            {
                                path: 'upload',
                                element: <UploadDocumentWrapper />,
                            },
                        ],
                    },

                    {
                        path: 'complete-profile',
                        element: (
                            <Navigate
                                to="/get-started/home-address"
                                replace
                            />
                        ),
                    },
                    { path: 'home-address', element: <HomeAddressPage /> },
                    { path: 'ministry-input', element: <MinistryInputPage /> },
                    { path: 'tour-guide', element: <TourGuidePage /> },
                ],
            },

            {
                path: 'dashboard',
                element: <Dashboard />,
                roles: INTERNAL_PORTAL_ROLES,
            },

            {
                path: 'studio/:studioCode',
                element: <StudioPortal />,
                roles: INTERNAL_PORTAL_ROLES,
            },

            {
                path: 'sermons',
                element: <Sermons />,
                roles: INTERNAL_PORTAL_ROLES,
            },
            {
                path: 'analytics',
                element: <Analytics />,
                roles: INTERNAL_PORTAL_ROLES,
            },

            {
                path: 'bin',
                element: <Bin />,
                roles: INTERNAL_PORTAL_ROLES,
            },
            {
                path: 'profile',
                element: <UserProfile />,
                roles: INTERNAL_PORTAL_ROLES,
            },
            {
                path: 'profile/change-password',
                element: <ChangePassword />,
                roles: INTERNAL_PORTAL_ROLES,
            },
        ],
    },
];
