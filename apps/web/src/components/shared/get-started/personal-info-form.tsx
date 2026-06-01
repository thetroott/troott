import { useCallback, useEffect, useMemo, useState } from 'react';
import CountrySelect from '@/components/shared/get-started/CountrySelect';
import LegalNameInput from './LegalNameInput';
import DateOfBirthPicker from './DOBPicker';
import useContextType from '@/hooks/shared/useContextType';
import type { ICountry } from '@/utils/interfaces.util';
import {
    readHydratedPersonalCountry,
    readPersonalDraft,
    writePersonalDraft,
} from '@/services/get-started-draft-storage';

function isoFromUserDob(raw: unknown): string | null {
    if (raw == null) return null;
    if (raw instanceof Date) return raw.toISOString().slice(0, 10);
    if (typeof raw === 'string') {
        const t = Date.parse(raw);
        if (Number.isNaN(t)) return null;
        return new Date(t).toISOString().slice(0, 10);
    }
    return null;
}

const PersonalInfoForm = () => {
    const { userContext } = useContextType();
    const user = userContext.user as {
        firstName?: string;
        lastName?: string;
        country?: ICountry;
        dateOfBirth?: unknown;
    } | null;

    const draft = useMemo(() => readPersonalDraft(), []);
    const hydratedCountry = readHydratedPersonalCountry();
    const [country, setCountry] = useState<ICountry | undefined>(
        (draft?.country ?? hydratedCountry ?? user?.country) as
            | ICountry
            | undefined,
    );
    const [dobIso, setDobIso] = useState<string | null>(
        draft?.dateOfBirth ??
            isoFromUserDob(user?.dateOfBirth) ??
            null,
    );

    const persist = useCallback(() => {
        const prev = readPersonalDraft() ?? {};
        writePersonalDraft({
            ...prev,
            country: country
                ? {
                      code2: country.code2,
                      name: country.name,
                      phoneCode: country.phoneCode,
                      flag: country.flag,
                  }
                : prev.country,
            dateOfBirth: dobIso ?? prev.dateOfBirth,
        });
    }, [country, dobIso]);

    useEffect(() => {
        persist();
    }, [persist]);

    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName ?? '';

    return (
        <>
            <div className="">
                <CountrySelect value={country} onChange={setCountry} />

                <LegalNameInput
                    id="Legal-name"
                    firstName={firstName}
                    lastName={lastName}
                    label="Legal Name"
                    description="As shown on your government-issued ID"
                    className="mt-8 "
                />

                <DateOfBirthPicker
                    label="Date of Birth"
                    className="mt-6"
                    initialIsoDate={
                        draft?.dateOfBirth ??
                        isoFromUserDob(user?.dateOfBirth) ??
                        undefined
                    }
                    onDateIsoChange={setDobIso}
                />
            </div>
        </>
    );
};

export default PersonalInfoForm;
