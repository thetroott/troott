import countries from "world-countries"
import type { ICountry } from "./interfaces.util";
import { toast } from "sonner";

const sortData = (data: Array<any>, filter: string = ''): Array<any> => {

    let sorted: Array<any> = [];

    if (filter !== '') {

        sorted = data.sort((a, b) => {
            if (a[filter].toString() < b[filter].toString()) { return -1 }
            else if (a[filter].toString() > b[filter].toString()) { return 1 }
            else { return 0 }
        })
    }

    if (filter === '') {

        sorted = data.sort((a, b) => {
            if (a.toString() < b.toString()) { return -1 }
            else if (a.toString() > b.toString()) { return 1 }
            else { return 0 }
        })
    }

    return sorted;
}


const getCountry = (code: string): ICountry | null => {

    let result: ICountry | null = null;
    const countries: Array<ICountry> = readCountries();

    if (countries.length > 0) {

        const country = countries.find((x) => x.code2 === code);

        if (country) {
            result = country
        }
    }

    return result;

}



const readCountries = (): Array<ICountry> => {
    const result: Array<ICountry> = countries.map((country) => ({
        name: country.name.common,
        code2: country.cca2,
        code3: country.cca3,
        capital: country.capital?.[0] || "",
        region: country.region,
        subregion: country.subregion,
        currencyCode: Object.keys(country.currencies || {})[0] || "",
        currencyImage: "", // set manually or map later
        phoneCode: `${country.idd.root || ''}${country.idd.suffixes?.[0] || ''}`,
        flag: `/images/flags/${country.cca2.toLowerCase()}.svg`
        // flag: `https://flagcdn.com/w40/${country.cca2.toLowerCase()}.png`
    }));

    return sortData(result, 'name');
}

const listCountries = () => {

    let result: Array<{ code: string, name: string, phone: string }> = [];
    const countries: Array<ICountry> = readCountries();

    if (countries.length > 0) {

        result = countries.map((x) => {

            let phone = x.phoneCode ? x.phoneCode : '';
            if(x.phoneCode && x.phoneCode.includes('-')){
                phone = '+' + x.phoneCode.substring(3)
            }

            return {
                code: x.code2,
                name: x.name,
                phone: phone
            }
        })

        result = result.filter((x) => x.phone !== '')

    }

    return result

}


const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => `${currentYear - i}`)
const months = [
  { value: "01", name: "January" },
  { value: "02", name: "February" },
  { value: "03", name: "March" },
  { value: "04", name: "April" },
  { value: "05", name: "May" },
  { value: "06", name: "June" },
  { value: "07", name: "July" },
  { value: "08", name: "August" },
  { value: "09", name: "September" },
  { value: "10", name: "October" },
  { value: "11", name: "November" },
  { value: "12", name: "December" },
]

const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`.padStart(2, "0"))


// utils/firstTimeUser.ts
const STORAGE_KEY = 'hasVisited';

/**
 * Check if the user is visiting for the first time
 * @returns boolean - true if first time, false if returning
 */
const isFirstTimeUser = (): boolean => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value !== 'true';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    // fallback to treating user as first time
    return true;
  }
};

/**
 * Mark user as returning
 */
const markUserAsReturning = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

/**
 * Full helper to check and handle navigation logic
 * @param onFirstTime callback when user is first time
 * @param onReturning callback when user is returning
 */
const handleUserNavigation = (
  onFirstTime: () => void,
  onReturning: () => void
) => {
  if (isFirstTimeUser()) {
    onFirstTime();
    markUserAsReturning();
  } else {
    onReturning();
  }
};


const handleMutationError = (error: any) => {
  const message =
    error?.response?.data?.errors?.[0] ||
    error?.response?.data?.message ||
    error.message
  toast.error(message);
};




export {
    sortData,
    getCountry,
    readCountries,
    listCountries,
    handleUserNavigation,
    isFirstTimeUser,
    markUserAsReturning,
    handleMutationError,
    currentYear,
    years,
    months,
    days,
    
}