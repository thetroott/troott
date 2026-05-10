import { IAPIKey, ICountry, IUserPermission } from '../utils/interfaces.util';
import Listener from './Listener.model';
import Minister from './Minister.model';

interface User {
    code: string; // user public ID

    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    dateOfBirth: Date;
    phoneNumber: string;
    phoneCode: string;
    countryPhone: string;
    country: ICountry;
    homeCountry: ICountry;

    avatar: string;
    banner: string;
    slug: string;
    email: string; // the registration email of the minister

    altPhone: string;
    passwordType: string;
    userType: string;
    login: {
        last: string;
        method: string;
    };
    onboard: {
        step: number;
        stage: string;
    };
    status: {
        profile: string;
    };
    inviteStatus: string;
    apiKey: IAPIKey;
    keys: Array<IAPIKey>;

    isSuper: boolean;
    isAdmin: boolean;
    isUser: boolean;
    isListener: boolean;
    isMinister: boolean;
    isActivated: boolean;
    isDeactivated: boolean;
    isSuspended: boolean;
    isActive: boolean;
    loginLimit: number;
    isLocked: boolean;

    followers: Array<User | any>;
    followings: Array<User | any>;

    // relationships
    roles: Array<any>;
    permissions: Array<IUserPermission>;
    verification: any;
    notifications: Array<any>;
    devices: Array<any>;
    listener: Listener | any;
    minister: Minister | any;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default User;
