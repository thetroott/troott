

export interface UserDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  
    phoneNumber: string;
    phoneCode: string;
    country: string;
  
    userType: string;
    isAdmin: boolean;
    isMinister: boolean;
    isCreator: boolean;
    isListener: boolean;
    isActive: boolean;
    isLocked: boolean;
    lockedUntil: Date | null;
  
    notificationPreferences: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  
    roles: string[];
  
    profiles: {
      listener: string;
      creator: string;
      preacher: string;
      staff: string;
    };
  
    createdAt: string;
    updatedAt: string;
  }
  

export interface editUserDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
  
    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
  }
  

  export interface ListenerDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
  
    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
  }
  