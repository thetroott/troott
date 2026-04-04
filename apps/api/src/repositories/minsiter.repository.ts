import { Model } from "mongoose";
;
import { IMinisterDoc, IResult } from "../utils/interfaces.util";
import Minister from "../models/Minister.model";

class ministerProfileRepository {
  private model: Model<IMinisterDoc>;

  constructor() {
    this.model = Minister;
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
      result.message = "minister profile not found";
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
      result.message = "minister profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name getministers
   * @returns {Promise<IResult>}
   */
  public async getministers(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({}).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name createministerProfile
   * @param profileData
   * @returns {Promise<IResult>}
   */
  public async createministerProfile(profileData: Partial<IMinisterDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newProfile = await this.model.create(profileData);
    result.data = newProfile;
    result.message = "minister profile created successfully";

    return result;
  }

  /**
   * @name updateministerProfile
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateministerProfile(id: string, updateData: Partial<IMinisterDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "minister profile not found";
    } else {
      result.message = "minister profile updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }

  /**
   * @name deleteministerProfile
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteministerProfile(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedProfile = await this.model.findByIdAndDelete(id);
    if (!deletedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "minister profile not found";
    } else {
      result.message = "minister profile deleted successfully";
      result.data = deletedProfile;
    }

    return result;
  }

  /**
   * @name getministersByMinistry
   * @param ministry
   * @returns {Promise<IResult>}
   */
  public async getministersByMinistry(ministry: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({ ministry }).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name getFollowers
   * @param ministerId
   * @returns {Promise<IResult>}
   */
  public async getFollowers(ministerId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(ministerId).select("followers").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "minister profile not found";
    } else {
      result.data = profile.followers;
    }

    return result;
  }

  /**
   * @name getSermons
   * @param ministerId
   * @returns {Promise<IResult>}
   */
  public async getSermons(ministerId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(ministerId).select("sermons").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "minister profile not found";
    } else {
      result.data = profile.sermons;
    }

    return result;
  }

  /**
   * @name getBites
   * @param ministerId
   * @returns {Promise<IResult>}
   */
  public async getBites(ministerId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(ministerId).select("bites").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "minister profile not found";
    } else {
      result.data = profile.bites;
    }

    return result;
  }

  /**
   * @name getPlaylists
   * @param ministerId
   * @returns {Promise<IResult>}
   */
  public async getPlaylists(ministerId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(ministerId).select("playlists").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "minister profile not found";
    } else {
      result.data = profile.playlists;
    }

    return result;
  }

  /**
   * @name updateVerificationStatus
   * @param ministerId
   * @param status
   * @returns {Promise<IResult>}
   */
  public async updateVerificationStatus(ministerId: string, status: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(
      ministerId,
      { verificationStatus: status, isVerified: status === "verified" },
      { new: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "minister profile not found";
    } else {
      result.message = "Verification status updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }
}

export default new ministerProfileRepository();
