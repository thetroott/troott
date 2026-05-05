import DashboardLayout from '@/components/layouts/DashboardLayout';
import Home from '@/app/home/Home';
import Dashboard from '@/app/dashboard/Dashboard';
import GetStarted from '@/app/get-started/GetStarted';
import Sermons from '@/app/sermons/MySermons';
import Analytics from '@/app/analytics/Analytics';
import InnerLayout from '@/components/layouts/InnerLayout';
import UserAccount from '@/app/account/GetVerified';
import HomeProfile from '@/app/account/HomeAddressInfo';
import PersonalInfo from '@/app/account/VerifyUserInfo';
import VerifyDocument from '@/app/account/VerifyDocument';
import SelectDocumentType from '@/components/shared/get-started/SelectDocumentType';
import VerifyDocumentForm from '@/components/shared/get-started/verify-document';
import Bin from '@/app/bin/Bin';
import VerifyDocument1 from '@/components/shared/get-started/verify-document1';
import { UploadDocumentWrapper } from '@/components/shared/upload';
import HomeAddressPage from '@/app/account/HomeAddressInfo';
import MinistryInputPage from '@/app/account/MinistryInfo';

export const privateRoutes = [
    {
        path: '/',
        element: <Home />,
        roles: ['admin', 'staff', 'preacher'],
    },
    {
        path: '',
        element: <DashboardLayout />,
        children: [
            // get-started landing page
            {
                path: 'get-started',
                element: <GetStarted />,
                roles: ['admin', 'staff', 'preacher'],
            },

            // get-started sub routes using InnerLayout
            {
                path: 'get-started',
                element: <InnerLayout />,
                roles: ['admin', 'staff', 'preacher'],
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
                                path: 'verify-account/verify-document',
                                element: <VerifyDocument />,
                                children: [
                                    {
                                        index: true,
                                        path: '',
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
                        ],
                    },

                    {
                        path: 'complete-profile',
                        element: <HomeProfile />,
                    },
                    { path: 'home-address', element: <HomeAddressPage /> },
                    { path: 'ministry-input', element: <MinistryInputPage /> },
                ],
            },

            {
                path: 'get-started/tour-guide',
                element: '',
            },

            {
                path: 'dashboard',
                element: <Dashboard />,
                roles: ['admin', 'staff', 'preacher'],
            },

            {
                path: 'sermons',
                element: <Sermons />,
                roles: ['admin', 'staff', 'preacher'],
            },
            {
                path: 'analytics',
                element: <Analytics />,
                roles: ['admin', 'staff', 'preacher'],
            },

            {
                path: 'bin',
                element: <Bin />,
                roles: ['admin', 'staff', 'preacher'],
            },
        ],
    },
];
