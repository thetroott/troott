import { Request } from 'express';

import { IBulkUser, IResult, IUserDoc } from "../utils/interfaces.util";
import { UIID } from "@btffamily/pacitude";
import { OAuthProvider, PasswordType, UserType } from "../utils/enums.util";
import { createSocialUserDTO, createUserDTO, IPassportProfileDTO } from "../dtos/user.dto";
import User from "../models/User.model";
import PermissionService from "./permission.service";
import listenerService from "./listener.service";
import { IPermissionDTO } from "../dtos/system.dto";
import AdminService from "./admin.service";
import authService from "./auth.service";
import ministerService from "./minister.service";
import userRepository from "../repositories/user.repository";
import { SocialIdKey } from "../utils/types.util";
import { generateRandomChars } from "../utils/helper.util";
import emailService from "./email.service";

class UserService {
  public result: IResult;

  constructor() {
    this.result = { error: false, message: "", code: 200, data: {} };
  }

  /**
   * @name createUser
   * @param data
   * @returns
   */
  public async createUser(data: createUserDTO): Promise<IUserDoc> {
    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      role,
      permissions,
    } = data;

    // Check if the user already exists
    // const existingUser = await userRepository.findUser(email.toLowerCase());
    // if (existingUser) {
    //   throw new Error(existingUser.message);
    // }

    // Create the user object
    let user: IUserDoc = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      userType,
      role,
      permissions,
      passwordType: data.passwordType,
    });

    // Attach role to user based on userType
    await authService.attachRole(user, userType);

    // Handle permissions (if no permissions provided, use a service to create default permissions)
    if (!permissions || permissions.length === 0) {
     const permResult = await PermissionService.initiatePermissionData(user);
      if (permResult.error) {
        throw new Error(permResult.message);
      }
      user = permResult.data as IUserDoc;
    } else {
      const permissionPayload: IPermissionDTO = {
        user: user._id.toString(),
        permissions,
        role: user.role,
      };
      const permissionUpdate = await PermissionService.updatePermissions(
        user,
        permissionPayload
      );
      if (permissionUpdate.error) {
        throw new Error(permissionUpdate.message);
      }

      user = permissionUpdate.data as IUserDoc;
    }


    if (user.userType === UserType.LISTENER) {
    const listenerProfile = await listenerService.createListener({
      user: user,
      type: UserType.LISTENER,
    });

      if (listenerProfile.error) {
        throw new Error(listenerProfile.message);
      }
      user = listenerProfile.data.user as IUserDoc;
    }


    if (user.userType === UserType.MINISTER) {

      const ministerProfile = await ministerService.createMinister({
        user: user,
        userType: UserType.MINISTER,
        email: user.email,
      });

      if (ministerProfile.error) {
        throw new Error(ministerProfile.message);
      }
      user = ministerProfile.data.user as IUserDoc;
    }


    if (user.userType === UserType.ADMIN) {
      const staffProfile = await AdminService.createAdmin({
        user: user,
        email: user.email,
      });
      
      if (staffProfile.error) {
        throw new Error(staffProfile.message);
      }
      user = staffProfile.data.user as IUserDoc;
    }

    await authService.encryptUserPassword(user, password);
    await user.save();

    return user;
  }

  /**
   * @name createBulkUsers
   * @param data
   * @param options
   */
  public async createBulkUsers(
    data: Array<IBulkUser>,
    options: { isNew: boolean }
  ): Promise<void> {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let bulk: IBulkUser = data[i];
        let password: string = UIID(1).toString();
        let exist = await User.findOne({ email: bulk.email });

        if (!exist && options.isNew) {
          // create the user
          let user = await User.create({
            firstName: bulk.firstName ? bulk.firstName : "",
            lastName: bulk.lastName ? bulk.lastName : "",
            email: bulk.email.toLowerCase(),
            password,
            phoneNumber: bulk.phoneNumber,
            phoneCode: bulk.phoneCode,
          });

          let phone = authService.attachPhoneCode(
            bulk.phoneCode,
            bulk.phoneNumber
          );
          user.countryPhone = phone;
          await user.save();

          // encrypt password
          await authService.encryptUserPassword(user, password);
        }
      }
    }
  }


  /**
   * @name createSocialUser
   * @description Creates a new user account specifically from a social login profile.
   * @param data - Social user data.
   * @returns {Promise<IUserDoc>} The newly created user document.
   */
  public async createSocialUser(data: createSocialUserDTO): Promise<IUserDoc> {
    
    const { firstName, lastName, email, userType, googleId, githubId, appleId } = data;


    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email.toLowerCase());
    if (existingUser) {
      throw new Error(existingUser.message);
    }


    // 2. Create the user object with placeholder password and social ID
    let user: IUserDoc = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: generateRandomChars(24), // Placeholder.
      passwordType: PasswordType.OAUTH,
      userType,
      googleId: googleId,
      githubId: githubId,
      appleId: appleId,
      isActive: true,
      isActivated: true,
    });
    

    await authService.updateUserType(user, userType);
    await authService.attachRole(user, userType);
   const permResult = await PermissionService.initiatePermissionData(user);
      if (permResult.error) {
        throw new Error(permResult.message);
      }
      user = permResult.data as IUserDoc;


    // 4. Create profile based on userType (REUSE EXISTING LOGIC)
    
    if (user.userType === UserType.LISTENER) {
      const listenerProfile = await listenerService.createListener({
        user: user,
        type: UserType.LISTENER,
      });
  
        if (listenerProfile.error) {
          throw new Error(listenerProfile.message);
        }
        user = listenerProfile.data.user as IUserDoc;
      }
  
  
      if (user.userType === UserType.MINISTER) {
  
        const ministerProfile = await ministerService.createMinister({
          user: user,
          userType: UserType.MINISTER,
          email: user.email,
        });
  
        if (ministerProfile.error) {
          throw new Error(ministerProfile.message);
        }
        user = ministerProfile.data.user as IUserDoc;
      }

    // 5. Save the final user (Mongoose pre-save hook will handle password 'encryption' if needed,
    // but for social it's a placeholder, so no real encryption runs)
    await user.save(); 

    // 6. Send welcome email (REUSED LOGIC FROM YOUR REGISTRATION SUCCESS BLOCK)
    const welcomeEmail = await emailService.sendUserWelcomeEmail(user);
    if (welcomeEmail.error) {
    }


    return user;
  }

  

  /**
   * @name findOrCreateSocialUser
   * @description Handles the core logic for social logins: find by ID, find by email, or create new user.
   * @param profile - The Passport profile object from the OAuth provider.
   * @param provider - 'google', 'github', or 'apple'.
   * @returns {Promise<IUserDoc>} The authenticated or newly created user document.
   */
  public async findOrCreateSocialUser(
    profile: IPassportProfileDTO,
    provider: OAuthProvider,
    req: Request
  ): Promise<IUserDoc | null> {

    const email = profile.emails?.[0]?.value.toLowerCase();
    const socialId = profile.id;
    let user: IUserDoc | null = null;
    
    // 1. Check if user already exists via the social ID (Primary check)
    const idField = `${provider}Id`; // e.g., 'googleId'
    user = await userRepository.findUserBySocialId(provider, socialId)

    if (!user) {
      
      // 2. Check if user exists via email (Attempt to link account)
      const userResult = await userRepository.findUser(email);

      if (!userResult.data) {
        throw new Error(userResult.message);
      }
      
      user = userResult.data;
      
      if (user) {
        
        user = await this.linkSocialAccount(user, idField, socialId);

      } else {
        // 3. User not found - CREATE A NEW SOCIAL USER
        user = await this.createSocialUser({
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          email: email,
          userType: UserType.LISTENER, 
          [idField]: socialId, // Add the specific social ID
        });
      }
    }


    if (user) {
      // 4. Finalize login (REUSE EXISTING LOGIC)
      await authService.activateAccount(user);
      await authService.updateLastLogin(user);
      //await authService.updateLoginInfo(user, req);

      user.save()

      return user;
    }


    return null;
  }


/**
   * @name linkSocialAccount
   * @description Links a local user account to a social ID.
   */
  private async linkSocialAccount(user: IUserDoc, idField: string, socialId: string): Promise<IUserDoc> {
    
    const key = idField as SocialIdKey;
    user[key] = socialId;
    user.passwordType = PasswordType.OAUTH; 
    await user.save();
    return user;
  }



  

  




  /**
   * Checks if a user has either the admin or creator role.
   * @param {string} userId The ID of the user to check.
   * @returns {Promise<boolean>} A promise that resolves to true if the user is an admin or creator, otherwise false.
   */
  public async findRole(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    // Find the user by ID
    const user = await User.findById(userId);

    // If the user is not found, they cannot be an admin or creator.
    if (!user) {
      result.error = true;
      result.code = 400;
      result.message = "user not found";
      return result;
    }

    if (user.isAdmin) {
      // userType is admin

      result.data = true;
      result.message = "user is an admin";

    } else if (user.isCreator) {
      // userType is creator
      result.data = true;
      result.message = "user is a creator";

    } else {
      result.data = false;
      result.message = "user is neither an admin nor a creator";
    }

    return result;
  }

  /**
   * @name updatePreferences
   * @param user
   * @param preferences
   */
  public async updateUserPreferences(
    user: IUserDoc,
    preferences: Partial<Pick<IUserDoc["preferences"], "topics" | "minister">>
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    if (!preferences.topics && !preferences.minister) {
      result.error = true;
      result.code = 400;
      result.message = "Invalid preferences: must provide topics or minister";
      return result;
    }

    if (preferences.topics) {
      user.preferences.topics = preferences.topics;
    }

    if (preferences.minister) {
      user.preferences.minister = preferences.minister;
    }

    result.message = "Preferences updated successfully";
    result.data = preferences.topics && !preferences.minister;

    await user.save();
    result.data = user.preferences;

    return result;
  }

  /**
   * Gets user notification preferences
   * @param userId - The ID of the user
   * @returns Object containing notification preference settings
   */
  public async getNotificationPreferences(userId: string): Promise<{
    email: boolean;
    push: boolean;
    sms: boolean;
  }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      email: user.notificationPreferences?.email ?? true,
      push: user.notificationPreferences?.push ?? true,
      sms: user.notificationPreferences?.sms ?? true,
    };
  }

  /**
   * Updates user notification preferences
   * @param userId - The ID of the user
   * @param preferences - Object containing notification preferences to update
   */
  public async updateNotificationPreferences(
    user: IUserDoc,
    notificationPreferences: Partial<IUserDoc["notificationPreferences"]>
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const hasAnyPreference =
      notificationPreferences.email !== undefined ||
      notificationPreferences.push !== undefined ||
      notificationPreferences.sms !== undefined;

    if (!hasAnyPreference) {
      result.error = true;
      result.code = 400;
      result.message =
        "Invalid notification preferences: must provide at least one setting";
      return result;
    }

    if (notificationPreferences.email !== undefined) {
      user.notificationPreferences.email = notificationPreferences.email;
    }
    if (notificationPreferences.push !== undefined) {
      user.notificationPreferences.push = notificationPreferences.push;
    }
    if (notificationPreferences.sms !== undefined) {
      user.notificationPreferences.sms = notificationPreferences.sms;
    }

    await user.save();

    result.message = "Notification preferences updated successfully";
    result.data = user.notificationPreferences;

    return result;
  }
}

export default new UserService();
