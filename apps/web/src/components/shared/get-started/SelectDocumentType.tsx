import { useState } from 'react';
import IconRadioSelect from './IconRadioSelect';
import { FaIdCard, FaPassport } from 'react-icons/fa';

const SelectDocumentType = () => {
    const [contactType, setContactType] = useState('email');

    const handleDocumentTypeChange = (value: string) => {
        setContactType(value);
        // Store selected document type in localStorage
        localStorage.setItem('selectedDocumentType', value);
    };

    return (
        <>
            <div className="text-base text-muted-foreground">
                <p>Document Type</p>
            </div>

            <div className="mt-2">
                <IconRadioSelect
                    value={contactType}
                    onChange={handleDocumentTypeChange}
                    options={[
                        {
                            label: 'National Identity Number (NIN)',
                            value: 'nin',
                            icon: <FaIdCard className="w-5 h-5" />,
                        },
                        {
                            label: "Driver's License",
                            value: 'drivers-license',
                            icon: <FaIdCard className="w-5 h-5" />,
                        },
                        {
                            label: 'International Passport',
                            value: 'passport',
                            icon: <FaPassport className="w-5 h-5" />,
                        },
                    ]}
                />
            </div>
        </>
    );
};

export default SelectDocumentType;
