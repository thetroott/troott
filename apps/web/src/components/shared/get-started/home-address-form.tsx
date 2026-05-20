import AddressInput from './AddressInput';
import PostalCode from './PostalCode';
import CityInput from './CityInput';
import CountrySelect from './CountrySelect';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ICountry } from '@/utils/interfaces.util';
import PhoneInput from './PhoneInput';
import useContextType from '@/hooks/shared/useContextType';
import {
    readAddressDraft,
    writeAddressDraft,
} from '@/services/get-started-draft-storage';

const HomeAddressForm = () => {
    const { userContext } = useContextType();
    const user = userContext.user as {
        location?: {
            address?: string;
            postalCode?: string;
            city?: string;
            state?: string;
            country?: string;
        };
        phoneNumber?: string;
        phoneCode?: string;
        country?: ICountry;
    } | null;

    const draft = useMemo(() => readAddressDraft(), []);

    const [selectedCountry, setSelectedCountry] = useState<
        ICountry | undefined
    >(undefined);
    const [street, setStreet] = useState(
        draft?.address ?? user?.location?.address ?? '',
    );
    const [postalCode, setPostalCode] = useState(
        draft?.postalCode ?? user?.location?.postalCode ?? '',
    );
    const [city, setCity] = useState(draft?.city ?? user?.location?.city ?? '');
    const [stateVal] = useState(
        draft?.state ?? user?.location?.state ?? '',
    );
    const [countryName, setCountryName] = useState(
        draft?.country ?? user?.location?.country ?? '',
    );
    const [phoneNumber, setPhoneNumber] = useState(
        draft?.phoneNumber ?? user?.phoneNumber ?? '',
    );

    useEffect(() => {
        if (selectedCountry) return;
        if (user?.country) setSelectedCountry(user.country);
    }, [user?.country, selectedCountry]);

    useEffect(() => {
        if (selectedCountry?.name) setCountryName(selectedCountry.name);
    }, [selectedCountry]);

    const persist = useCallback(() => {
        writeAddressDraft({
            address: street,
            postalCode,
            city,
            state: stateVal,
            country: countryName || selectedCountry?.name || '',
            phoneNumber,
            phoneCode: selectedCountry?.phoneCode
                ? String(selectedCountry.phoneCode)
                : draft?.phoneCode ?? '',
        });
    }, [
        street,
        postalCode,
        city,
        stateVal,
        countryName,
        selectedCountry,
        phoneNumber,
        draft?.phoneCode,
    ]);

    useEffect(() => {
        persist();
    }, [persist]);

    return (
        <>
            <div className="max-w-[410px]">
                <AddressInput
                    id="address"
                    street={street}
                    onChange={setStreet}
                    className="mt-8 "
                />

                <PostalCode
                    postalCode={postalCode}
                    onChange={setPostalCode}
                    className="mt-6"
                />

                <CityInput city={city} onChange={setCity} className="mt-6" />

                <CountrySelect
                    value={selectedCountry}
                    onChange={(c) => {
                        setSelectedCountry(c);
                        setCountryName(c?.name ?? '');
                    }}
                    disabled={false}
                    className="mt-6"
                />

                <PhoneInput
                    phoneNumber={phoneNumber}
                    country={selectedCountry}
                    onPhoneChange={setPhoneNumber}
                    onCountryChange={setSelectedCountry}
                    disabled={false}
                    className="mt-6"
                />
            </div>
        </>
    );
};

export default HomeAddressForm;
