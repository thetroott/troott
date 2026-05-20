import { useCallback, useEffect, useMemo, useState } from 'react';
import MinistryDescription from './MinistryDescription';
import MinistryForm from './MinistryForm';
import MinistryLocation from './MinistryLocation';
import MinistryWebsite from './MinistryWebsite';
import useContextType from '@/hooks/shared/useContextType';
import {
    readMinistryDraft,
    writeMinistryDraft,
} from '@/services/get-started-draft-storage';

const MinistryInput = () => {
    const { userContext } = useContextType();
    const user = userContext.user as {
        firstName?: string;
        lastName?: string;
    } | null;

    const draft = useMemo(() => readMinistryDraft(), []);

    const [ministry, setMinistry] = useState(draft?.ministryName ?? '');
    const [website, setWebsite] = useState(draft?.websiteUrl ?? '');
    const [location, setLocation] = useState(draft?.hqLine ?? '');
    const [description, setDescription] = useState(draft?.description ?? '');

    const persist = useCallback(() => {
        writeMinistryDraft({
            ministryName: ministry,
            websiteUrl: website,
            hqLine: location,
            description,
        });
    }, [ministry, website, location, description]);

    useEffect(() => {
        persist();
    }, [persist]);

    return (
        <>
            <div className="max-w-[410px]">
                <MinistryForm
                    id="ministry-name"
                    ministry={ministry}
                    firstName={user?.firstName ?? ''}
                    lastName={user?.lastName ?? ''}
                    onChange={setMinistry}
                    className="mt-6"
                />

                <MinistryWebsite
                    website={website}
                    onChange={setWebsite}
                    className="mt-6"
                />

                <MinistryLocation
                    location={location}
                    onChange={setLocation}
                    className="mt-6"
                />

                <MinistryDescription
                    description={description}
                    onChange={setDescription}
                    className="mt-6"
                />
            </div>
        </>
    );
};

export default MinistryInput;
