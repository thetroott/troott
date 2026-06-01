import PageHeader from '@/components/shared/get-started/PageHeader';
import { Outlet, useLocation } from 'react-router-dom';
import {
    PATH_GET_STARTED,
    PATH_SEG_GET_STARTED_VERIFY_DOC_DOCUMENT1,
} from '@/routes/paths';

const DOCUMENT1_PATH = `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOC_DOCUMENT1}`;

const PRIVACY_DESCRIPTION =
    'Your ID will be used to verify your personal information.';
const D3_DESCRIPTION =
    'Please select a way to complete document verification';

function VerifyDocument() {
    const location = useLocation();
    const isUploadMethodStep = location.pathname === DOCUMENT1_PATH;

    return (
        <>
            <div className="mb-8">
                <PageHeader
                    title="Document Verification"
                    description={
                        isUploadMethodStep ? D3_DESCRIPTION : PRIVACY_DESCRIPTION
                    }
                />
            </div>

            <div className="mt-8 mx-auto pr-80">
                <Outlet />
            </div>
        </>
    );
}

export default VerifyDocument;
