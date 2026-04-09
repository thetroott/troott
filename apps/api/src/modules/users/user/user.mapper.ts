import { UserDTO, UserProfileDTO } from "./user.dto";
import { IUserDoc } from "./user.interface";

class UserMapper {
  constructor() {}

  /**
   * @name mapUser
   * @param user
   * @returns UserDTO
   */
  public async mapUser(user: IUserDoc): Promise<UserDTO> {
    const result: UserDTO = {
      id: user.id.toString(),

      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,

      phoneNumber: user.location?.phoneNumber,
      phoneCode: user.location?.phoneCode,
      country: user.location?.country,

      dateOfBirth: undefined,
      gender: undefined,

      userType: user.userType,
      isSuper: user.isSuper,
      isAdmin: user.isAdmin,
      isOrganisation: false,
      isTalent: user.isTalent,

      

      isActive: user.isActive,
      isLocked: user.isLocked,
      lockedUntil: user.lockedUntil,
    };

    return result;
  }

  
  /**
   * @name mapUserProfile
   * @param user
   * @returns UserDTO
   */
  public async mapUserProfile(user: IUserDoc): Promise<UserProfileDTO> {
    const result: UserProfileDTO = {
      id: user.id.toString(),

      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,

      phoneNumber: user.location?.phoneNumber,
      phoneCode: user.location?.phoneCode,
      country: user.location?.country,

      
      dateOfBirth: undefined,
      gender: undefined,

      userType: user.userType,
      

      

      isActive: user.isActive,
      
    };

    return result;
  }
}

export default new UserMapper();
