import { createAdminDTO } from "../dtos/profile.dto";
import Admin from "../models/Admin.model";
import { IResult, IUserDoc, IAdminDoc } from "../utils/interfaces.util";
import { UserType } from "../utils/enums.util";
import { generateRandomChars } from "../utils/helper.util";
import SystemService from "./system.service";

class AdminService {

  public async createAdmin(
    data: createAdminDTO
  ): Promise<IResult<{ admin: IAdminDoc; user: IUserDoc }>> {
    const result: IResult<{ admin: IAdminDoc; user: IUserDoc }> = {
      error: false,
      message: "",
      code: 200,
      data: {},
    };
  
    const { user } = data;
  
    const existingAdmin = await Admin.findOne({ user: user._id });
    if (existingAdmin) {
      return {
        error: true,
        message: "Admin profile already exists for this user",
        code: 400,
        data: {},
      };
    }
  
    const AdminProfileData = {
      _id: user._id,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      type: UserType.ADMIN,
      user: user._id,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
    };
  
    const admin = await Admin.create(AdminProfileData);
  
    admin.createdBy = {
      ...admin,
      admin: admin._id,
    };
    await user.save();
  
    return {
      error: false,
      message: "Admin profile created",
      code: 201,
      data: { Admin, user },
    };
  }
  
  public async updateAdminProfile(
    id: string,
    data: Partial<IAdminDoc>
  ): Promise<IAdminDoc> {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      throw new Error("Admin profile not found");
    }

    return updatedAdmin;
  }

  public async generateAPIKey(adminId: string): Promise<string> {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("admin not found");
    }

    const apiKey = generateRandomChars(52);
    await Admin.findByIdAndUpdate(adminId, {
      $push: {
        apiKeys: {
          key: apiKey,
          createdAt: new Date(),
          lastUsed: new Date()
        }
      }
    });

    return apiKey;
  }

  public async revokeAPIKey(adminId: string, keyId: string): Promise<void> {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("admin not found");
    }

    await Admin.findByIdAndUpdate(adminId, {
      $pull: {
        apiKeys: { key: keyId }
      }
    });
  }

  
  /**
   * @name encryptApiKeys
   * @param Admin
   * @param ApiKey
   * @returns
   */
  public async encryptApiKeys(
    Admin: IAdminDoc,
    apikey: string
  ): Promise<boolean> {
    try {
      const encrypted = await SystemService.encryptData({
        payload: apikey,
        password: Admin.email,
        separator: "-",
      });

      if (encrypted) {
        // Fix: Add the apiKey to the Admin's apiKeys array
        if (!Admin.apiKeys) {
          Admin.apiKeys = [];
        }
        
        Admin.apiKeys.push({
          key: encrypted,
          createdAt: new Date(),
          lastUsed: new Date()
        });
        
        await Admin.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error encrypting API key:", error);
      return false;
    }
  }

  /**
   * @name decryptApiKeys
   * @param user
   * @returns
   */
  public async decryptApiKeys(admin: IAdminDoc, keyIndex?: number): Promise<string | null> {
    try {
      if (!admin.apiKeys || admin.apiKeys.length === 0) {
        return null;
      }

      const targetKey = typeof keyIndex === 'number' 
        ? admin.apiKeys[keyIndex]
        : admin.apiKeys[admin.apiKeys.length - 1];

      if (!targetKey) {
        return null;
      }

      const decrypted = await SystemService.decryptData({
        password: admin.email,
        payload: targetKey.key,
        separator: "-",
      });

      return decrypted.data?.toString() || null;
    } catch (error) {
      console.error("Error decrypting API key:", error);
      return null;
    }
  }


  public async manageIPWhitelist(adminId: string, ips: string[]): Promise<void> {
    const admin = await Admin.findById(adminId);
    if (!Admin) {
      throw new Error("Admin not found");
    }

    await Admin.findByIdAndUpdate(adminId, {
      $set: { ipWhitelist: ips }
    });
  }

  public async recordAction(
    adminId: string,
    action: string,
    targetId: string
  ): Promise<void> {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("admin not found");
    }

    await Admin.findByIdAndUpdate(adminId, {
      $push: {
        actionsTaken: {
          action,
          targetId,
          timestamp: new Date()
        }
      }
    });
  }

  public async moderateContent(
    adminId: string,
    contentId: string
  ): Promise<void> {
    const admin = await Admin.findById(adminId);
    if (!Admin) {
      throw new Error("Admin not found");
    }

    await Admin.findByIdAndUpdate(adminId, {
      $push: {
        moderatedContent: contentId
      }
    });

    await this.recordAction(adminId, 'content_moderation', contentId.toString());
  }

  public async updatePermissions(
    adminId: string,
    permissions: Array<string> 
  ): Promise<void> {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    await Admin.findByIdAndUpdate(adminId, {
      $set: { permissions }
    });

    await this.recordAction(
      adminId,
      'permissions_updated',
      `Updated permissions: ${permissions.join(', ')}`
    );
  }

  public async updateAccessLevel(
    adminId: string,
    level: number
  ): Promise<void> {
    const admin = await Admin.findById(adminId);
    if (!Admin) {
      throw new Error("Admin not found");
    }

    await Admin.findByIdAndUpdate(adminId, {
      $set: { accessLevel: level }
    });

    await this.recordAction(
      adminId,
      'access_level_updated',
      `Updated access level to: ${level}`
    );
  }

  public async getAdminProfile(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const admin = await Admin.findOne({ user: userId })
      .populate("moderatedContent")
      .populate("actionsTaken")
      .select("-apiKeys.key"); // Exclude sensitive API key data

    if (!admin) {
      result.error = true;
      result.message = "Admin profile not found";
      result.code = 404;
      return result;
    }

    result.data = Admin;
    return result;
  }
}

export default new AdminService();