import apiCall from "@/api/config";
import type { IAPIResponse } from "@/utils/interfaces.util";
import type {
  ActivateDTO,
} from "@/dtos/auth.dto";

/**
 * UserService
 * Handles authentication-related API calls and client-side token storage.
 */
const UserService = {


  /**
   * @name activateUser
   * @description Activate a user account (OTP verification after registeration)
   * @param {VerifyOtpDTO} payload - The OTP verification request payload.
   * @param {string} payload.email - The email tied to the OTP.
   * @param {string} payload.otp - The OTP code entered by the user.
   * @returns {Promise<IAPIResponse>} The API response confirming verification.
   */
  getUser: async (payload: ActivateDTO): Promise<IAPIResponse> => {
    const res = await apiCall.user.getUser(payload);
    return res;
  },

  getUsers: async (payload: string): Promise<IAPIResponse> => {
    const res = await apiCall.user.getUsers(payload)
    return res;
  }
 
};

export default UserService;
