//import { IAPIKey, IUserCountry, IUserPermission } from "../utils/interfaces.util";

interface User {
    code: string; // user public ID

    firstName: string;
    lastName: string;
    middleName: string;
    phoneNumber: string;
    phoneCode: string;
    countryPhone: string;
    altPhone: string;

    email: string;
    passwordType: string;
    userType: string;
    businessName: string;
    businessType: string;

    avatar: string;
    coverImage: string;
    timezone: string;
    location: ILocation;

    login: {
        last: string;
        method: string;
    };
    onboard: {
        step: number;
        status: string;
    };
    status: {
        profile: string;
    };
    inviteStatus: string;
    // apiKey: IAPIKey
    // keys: Array<IAPIKey>
    devices: Array<any>;

    isSuper: boolean;
    isAdmin: boolean;
    isBusiness: boolean;
    isUser: boolean;
    isTalent: boolean;
    isActivated: boolean;
    isActive: boolean;
    loginLimit: number;
    isLocked: boolean;
    twoFactorEnabled: boolean;

    // relationships
    //country: IUserCountry;
    roles: Array<any>;
    //permissions: Array<IUserPermission>;
    verification: any;
    notifications: Array<any>;
    creadedBy: any;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: any;
    id: any;
}

interface ILocation {
    phoneCode: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

interface IDevice {}

export default User;
