import { IUserCountry } from "../utils/interfaces.util"

interface Business {

    code: string,
    logo: string,
    name: string,
    email: string,
    businessType: string,
    profile: {
        description: string,
        legalName: string,
        industry: string,
        phoneNumber: string,
        phoneCode: string,
        countryPhone: string,
        email: string,
        websiteUrl: string,
    },
    country: IUserCountry,
    onboarding: {
        step: number,
        status: string,
    }
    location: {
        city: string,
        state: string,
        address: string,
    }
    slug: string,

    settings: string | any
    subscription: string | any
    user: string | any
    talents: Array<string | any>
    recipients: Array<string | any>
    assessments: Array<string | any>
    groups: Array<string | any>
    roadmaps: Array<string | any>
    transactions: Array<string | any>
    projects: Array<string | any>
    tickets: Array<string | any>

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export default Business