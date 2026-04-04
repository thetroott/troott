import { IMinisterDoc, IResult, IUserDoc } from "../utils/interfaces.util";
import { ObjectId } from "mongoose";
import Sermon from "../models/Sermon.model";
import Minister from "../models/Minister.model";
import { UserType, VerificationStatus } from "../utils/enums.util";
import { createMinisterDTO } from "../dtos/profile.dto";

class MinisterService {
  /**
   * @method createMinister
   * @description Creates a new minister profile for a given user.
   * Ensures that a minister profile does not already exist for the user,
   * enriches the payload with default values (userType, verification status, etc.),
   * and saves it into the database.
   *
   * @param {createMinisterDTO} data - The minister profile creation payload.
   * @param {IUserDoc} data.user - The user document associated with the minister.
   * @param {string} data.email - Minister's email address.
   * @param {string} data.slug - Unique slug identifier for the minister.
   * @param {string} data.description - Description of the minister.
   * @param {string} data.ministry - Name of the ministry.
   * @param {string} data.ministryHq - Headquarters of the ministry.
   * @param {string} data.ministryWebsite - Website of the ministry.
   *
   * @returns {Promise<IResult<{ minister: IMinisterDoc; user: IUserDoc }>>}
   * A structured result object containing:
   * - {boolean} error - Whether the creation failed.
   * - {string} message - Human-readable description of the outcome.
   * - {number} code - HTTP-style status code.
   * - {object|null} data - On success, contains both the created minister document
   *   and the associated user document. Otherwise null.
   *
   * @throws {Error} If database operations fail.
   */

  public async createMinister(
    data: createMinisterDTO
  ): Promise<IResult<{ minister: IMinisterDoc; user: IUserDoc }>> {
    const result: IResult<{ minister: IMinisterDoc; user: IUserDoc }> = {
      error: false,
      message: "",
      code: 200,
      data: null,
    };

    const { user } = data;

    const existingminister = await Minister.findOne({ user: user._id });
    if (existingminister) {
      result.error = true;
      result.message = "minister profile already exists for this user";
      result.code = 400;
      return result;
    }

    const ministerProfileData: createMinisterDTO = {
      ...data,
      userType: UserType.MINISTER,
      email: data.email,
      slug: data.slug,
      description: data.description,
      ministry: data.ministry,
      ministryHq: data.ministryHq,
      ministryWebsite: data.ministryWebsite,
      createdBy: data.user._id,
      verificationStatus: VerificationStatus.PENDING,
      isVerified: false,
    };

    const minister: IMinisterDoc = await Minister.create(ministerProfileData);
    if (!minister) {
      result.error = true;
      result.message = "Failed to create minister profile";
      result.code = 500;
      return result;
    }

    result.error = false;
    result.message = "minister profile created";
    result.code = 200;
    result.data = { minister, user };
    return result;
  }

  /**
   * @name updateMinister
   * @description Updates a minister profile with the provided data.
   * @param {string} userId - The ID of the user associated with the minister profile.
   * @param {Partial<IMinisterDoc>} data - Fields to update in the minister profile.
   * @returns {Promise<IResult>} A structured result containing success or error details.
   */
  public async updateMinister(
    userId: string,
    data: Partial<IMinisterDoc>
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await Minister.findByIdAndUpdate(
      { user: userId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 500;
      return result;
    }

    result.error = false;
    result.message = "Listener Profile updated successfully";
    result.code = 200;
    result.data = updatedProfile;
    return result;
  }

  /**
   * @name submitVerification
   * @description Submits verification documents for a minister and updates their status to PENDING.
   * @param {ObjectId} ministerId - The ID of the minister to verify.
   * @param {string[]} documents - An array of document URLs or references to be submitted.
   * @returns {Promise<void>} Resolves when the documents and verification status are updated.
   * @throws {Error} If the minister is not found.
   */

  public async submitVerification(
    ministerId: ObjectId,
    documents: string[]
  ): Promise<void> {
    const minister = await Minister.findById(ministerId);
    if (!minister) {
      throw new Error("minister not found");
    }

    await Minister.findByIdAndUpdate(ministerId, {
      $set: {
        identification: documents,
        verificationStatus: VerificationStatus.PENDING,
      },
    });
  }

  /**
   * @name updateVerificationStatus
   * @description Updates the verification status of a minister (e.g., APPROVED, REJECTED, PENDING).
   *              Sets `isVerified` and `verifiedAt` based on the status.
   * @param {ObjectId} ministerId - The ID of the minister to update.
   * @param {VerificationStatus} status - The new verification status to assign.
   * @returns {Promise<void>} Resolves when the status is updated.
   * @throws {Error} If the minister is not found.
   */
  public async updateVerificationStatus(
    ministerId: ObjectId,
    status: VerificationStatus
  ): Promise<void> {
    const minister = await Minister.findById(ministerId);
    if (!minister) {
      throw new Error("minister not found");
    }

    await Minister.findByIdAndUpdate(ministerId, {
      $set: {
        verificationStatus: status,
        isVerified: status === VerificationStatus.APPROVED,
        verifiedAt: status === VerificationStatus.APPROVED ? new Date() : null,
      },
    });
  }

  /**
   * @name getMinisterProfile
   * @description Fetches a minister profile by user ID with related data populated.
   * @param {string} userId - The ID of the user associated with the minister profile.
   * @returns {Promise<IResult>} A structured result containing the minister profile data or an error message.
   */
  public async getMinisterProfile(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const minister = await Minister.findOne({ user: userId })
      .populate("sermons")
      .populate("playlists")
      .populate("followers")
      .populate("bites")
      .populate("featuredSermons")
      .populate("featuredPlaylists");

    if (!minister) {
      result.error = true;
      result.message = "minister profile not found";
      result.code = 404;
      return result;
    }

    result.data = minister;
    return result;
  }
}

export default new MinisterService();
