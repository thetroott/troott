interface User {
    code: string;
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
    roles: Array<any>;
    verification: any;
    notifications: Array<any>;
    creadedBy: any;
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
export default User;
//# sourceMappingURL=user.dto.d.ts.map