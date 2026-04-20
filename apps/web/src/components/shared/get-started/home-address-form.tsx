import AddressInput from "./AddressInput";
import PostalCode from "./PostalCode";
import CityInput from "./CityInput";
import CountrySelect from "./CountrySelect";
import { useState } from "react";
import type { ICountry } from "@/utils/interfaces.util";
import PhoneInput from "./PhoneInput";

const HomeAddressForm = () => {
  const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(undefined);
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <>
      <div className="max-w-[410px]">
       
        <AddressInput
          id="address"
          street={street}
          onChange={setStreet}
          className="mt-8 "
          // description="As shown on your government-issued ID"
          // description="This will be your legal name on your account"
        />

        <PostalCode
          postalCode={postalCode}
          onChange={setPostalCode}
          className="mt-6"
        />

        <CityInput
          city={city}
          onChange={setCity}
          className="mt-6"
        />

        <CountrySelect 
          value={selectedCountry}
          onChange={setSelectedCountry}
          disabled={true}
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
