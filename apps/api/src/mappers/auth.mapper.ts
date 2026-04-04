import { MapActivatedUserDTO, MapRegisteredUserDTO, MapUserDTO } from "../dtos/auth.dto";
import { IUserDoc } from "../utils/interfaces.util";

class AuthMapper {
  constructor() {}

  /**
   * @name mapRegisteredUser
   * @param user - IUserDoc
   * @returns result
   */
  public async mapRegisteredUser(
    user: IUserDoc
  ): Promise<MapRegisteredUserDTO> {
    const result: MapRegisteredUserDTO = {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,

      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,

      isSuper: user.isSuper,
      isAdmin: user.isAdmin,
      isMinister: user.isMinister,
      isCreator: user.isCreator,
      isListener: user.isListener,

      isActive: user.isActive,
      isLocked: user.isLocked,
      lockedUntil: user.lockedUntil,
      isActivated: user.isActivated,
      isDeactivated: user.isDeactivated,
      roles: user.role,
    };

    return result;
  }

    /**
   * @name mapActivatedUser
   * @param user - IUserDoc
   * @returns result
   */
    public async mapActivatedUser(
      user: IUserDoc,
      token: string
    ): Promise<MapActivatedUserDTO> {
      const result: MapActivatedUserDTO = {

        user: await this.mapRegisteredUser(user),
        token: token,
      };
  
      return result;
    }

    
    /**
   * @name mapActivatedUser
   * @param user - IUserDoc
   * @returns result
   */
    public async mapUser(
      user: IUserDoc,
      token: string
    ): Promise<MapUserDTO> {
      const result: MapUserDTO = {

        user: await this.mapRegisteredUser(user),
        token: token,
      };
  
      return result;
    }
}

export default new AuthMapper();
