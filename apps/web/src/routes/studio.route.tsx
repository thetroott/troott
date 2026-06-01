import Dashboard from '@/app/dashboard/Dashboard';
import MySermons from '@/app/sermons/MySermons';
import SermonUploadPage from '@/app/studio/SermonUploadPage';
import SermonDetailPlaceholder from '@/app/studio/SermonDetailPlaceholder';
import Analytics from '@/app/analytics/Analytics';
import Bin from '@/app/bin/Bin';
import StudioPortal from '@/app/studio/StudioPortal';
import { IRoute } from '@/utils/interfaces';
import {
    PATH_STUDIO,
    PATH_SEG_ANALYTICS,
    PATH_SEG_BIN,
    PATH_SEG_SERMONS,
    PATH_SEG_SERMONS_ID,
    PATH_SEG_SERMONS_ID_EDIT,
    PATH_SEG_SERMONS_ID_RESUME,
    PATH_SEG_SERMONS_UPLOAD,
    PATH_SEG_SERMONS_UPLOAD_DETAILS,
    PATH_SEG_SERMONS_UPLOAD_FILE,
    PATH_SEG_SERMONS_UPLOAD_PUBLISH,
    PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
} from './paths';

/** Studio product routes under /studio/:studioCode. */
const studioRoutes: Array<IRoute> = [
    {
        name: 'studio',
        url: PATH_STUDIO,
        isAuth: true,
        path: 'studio/:studioCode',
        element: <StudioPortal />,
        subroutes: [
            {
                name: 'studio-home',
                url: PATH_STUDIO,
                isAuth: true,
                index: true,
                element: <Dashboard />,
            },
            {
                name: 'sermons',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS}`,
                isAuth: true,
                path: PATH_SEG_SERMONS,
                element: <MySermons />,
            },
            {
                name: 'sermons-upload',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_UPLOAD}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_UPLOAD,
                element: <SermonUploadPage />,
            },
            {
                name: 'sermons-upload-file',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_UPLOAD_FILE}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_UPLOAD_FILE,
                element: <SermonUploadPage />,
            },
            {
                name: 'sermons-upload-details',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_UPLOAD_DETAILS}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_UPLOAD_DETAILS,
                element: <SermonUploadPage />,
            },
            {
                name: 'sermons-upload-thumbnail',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_UPLOAD_THUMBNAIL}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
                element: <SermonUploadPage />,
            },
            {
                name: 'sermons-upload-publish',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_UPLOAD_PUBLISH}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_UPLOAD_PUBLISH,
                element: <SermonUploadPage />,
            },
            {
                name: 'sermon-detail',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_ID}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_ID,
                element: <SermonDetailPlaceholder />,
            },
            {
                name: 'sermon-resume',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_ID_RESUME}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_ID_RESUME,
                element: <SermonDetailPlaceholder />,
            },
            {
                name: 'sermon-edit',
                url: `${PATH_STUDIO}/${PATH_SEG_SERMONS_ID_EDIT}`,
                isAuth: true,
                path: PATH_SEG_SERMONS_ID_EDIT,
                element: <SermonDetailPlaceholder />,
            },
            {
                name: 'analytics',
                url: `${PATH_STUDIO}/${PATH_SEG_ANALYTICS}`,
                isAuth: true,
                path: PATH_SEG_ANALYTICS,
                element: <Analytics />,
            },
            {
                name: 'bin',
                url: `${PATH_STUDIO}/${PATH_SEG_BIN}`,
                isAuth: true,
                path: PATH_SEG_BIN,
                element: <Bin />,
            },
        ],
    },
];

export default studioRoutes;
