import CountrySelect from '@/components/shared/get-started/CountrySelect';
import type { ICountry } from '@/utils/interfaces.util';
import { FileText, IdCard } from 'lucide-react';
import { IconText } from './IconText';
import { useState } from 'react';

const VerifyAccountForm = () => {
    const [country, setCountry] = useState<ICountry | null>(null);

    return (
        <>
            <div className="">
                <CountrySelect value={country} onChange={setCountry} />

                <h2 className="text-[15px] font-medium mt-6 text-muted-foreground">
                    Complete the following steps to verify your account in{' '}
                    <br />{' '}
                    <span className="font-bold text-foreground">7 minutes</span>
                </h2>

                <IconText
                    icon={IdCard}
                    text="Personal information"
                    className="text-sm text-muted-foreground mt-4"
                />

                <IconText
                    icon={FileText}
                    text="Government-issued ID"
                    className="text-sm text-muted-foreground mt-2"
                />
            </div>
        </>
    );
};

export default VerifyAccountForm;
