import PageHeader from '@/components/shared/get-started/PageHeader';
import { Outlet } from 'react-router-dom';

function VerifyDocument() {
    return (
        <>
            <div className="mb-8">
                <PageHeader
                    title="Document Verification"
                    description="Your ID will be used to verify your personal information."
                />
            </div>

            <div className="mt-8 mx-auto pr-80 ">
                <Outlet />
            </div>
        </>
    );
}

export default VerifyDocument;
