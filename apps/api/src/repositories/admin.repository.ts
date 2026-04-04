import { Model } from "mongoose";
import Admin from "../models/Admin.model";
import { IResult, IAdminDoc } from "../utils/interfaces.util";

class AdminRepository {
  private model: Model<IAdminDoc>;

  constructor() {
    this.model = Admin;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id);
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name findByEmail
   * @param email
   * @returns {Promise<IResult>}
   */
  public async findByEmail(email: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findOne({ email }).lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name getAllAdmins
   * @returns {Promise<IResult>}
   */
  public async getAllAdmins(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({}).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name createAdmin
   * @param profileData
   * @returns {Promise<IResult>}
   */
  public async createAdmin(profileData: Partial<IAdminDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newProfile = await this.model.create(profileData);
    result.data = newProfile;
    result.message = "Staff profile created successfully";

    return result;
  }

  /**
   * @name updateAdmin
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateAdmin(id: string, updateData: Partial<IAdminDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.message = "Staff profile updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }

  /**
   * @name deleteAdmin
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteAdmin(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedProfile = await this.model.findByIdAndDelete(id);
    if (!deletedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.message = "Staff profile deleted successfully";
      result.data = deletedProfile;
    }

    return result;
  }

  /**
   * @name getStaffByRole
   * @param role
   * @returns {Promise<IResult>}
   */
  public async getStaffByRole(role: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({ role }).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name getStaffByUnit
   * @param unit
   * @returns {Promise<IResult>}
   */
  public async getStaffByUnit(unit: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({ unit }).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name updateVerificationStatus
   * @param id
   * @param status
   * @returns {Promise<IResult>}
   */
  public async updateVerificationStatus(id: string, status: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(
      id,
      { verificationStatus: status, isVerified: status === "VERIFIED" },
      { new: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.message = "Verification status updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }
}

export default new AdminRepository();
