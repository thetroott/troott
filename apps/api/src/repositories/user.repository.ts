import mongoose, { FilterQuery, Model } from "mongoose";
import User from "../models/User.model";
import { IResult, IUserDoc } from "../utils/interfaces.util";
import tokenService from "../services/token.service";
import { OAuthProvider } from "../utils/enums.util";



class UserRepository {
  private model: Model<IUserDoc>;

  constructor() {
    console.log("Imported User model:", User);
    this.model = User as Model<IUserDoc>;;
    console.log("UserRepository initialized with model:", !!this.model);
  }
  



  /**
 * @name findUser
 * @param input - The ObjectId or slug of the user.
 * @returns {Promise<IResult>} Result object containing the user data or error information.
 * @description Fetch a user by its ObjectId or slug.
 */
  public async findUser(input: string): Promise<IResult> {
    const result: IResult = {
      error: false,
      message: "",
      code: 200,
      data: {},
    };

    const isEmail = input.includes("@");
    const isValidObjectId =
      mongoose.Types.ObjectId.isValid(input) &&
      new mongoose.Types.ObjectId(input).toString() === input;

    let user: IUserDoc | null = null;

    if (isEmail) {
      user = await this.model.findOne({ email: input });
    } else if (isValidObjectId) {
      user = await this.model.findById(input);
    } else {
      user = await this.model.findOne({ slug: input });
    }

    if (!user) {
      result.error = true;
      result.code = 404;
      result.message = "user not found";
      return result;
    }

    result.data = user.toJSON();
    result.message = "user fetched successfully";
    return result;
  }


  /**
   * @name findById
   * @param id
   * @param populate 
   * @returns user
   * @description Find a user by ID and populate related data
   */
  public async findById(id: string, populate: boolean = false): Promise<IUserDoc | null> {

    const dataPop = [
      { path: 'users' }
    ]

    const pop = populate ? dataPop : [];

    // define filter query
    const query: FilterQuery<IUserDoc> = { _id: id };

    const user = await this.model.findById(query).populate(pop);
    return user
  }

  /**
   * @name findByEmail
   * @param email
   * @returns {Promise<IResult>}
   */
  public async findByEmail(email: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const user = await this.model.findOne({ email });
    if (!user) {
      result.error = true;
      result.code = 404;
      result.message = "User not found";
    } else {
      result.error = false
      result.data = user;
      result.message = "User arealdy exist";
    }

    return result;
  }

  /**
   * @name getUsers
   * @returns {Promise<IResult>}
   */
  public async getUsers(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const users = await this.model.find({}).lean();
    result.data = users;

    return result;
  }

  /**
   * @name createUser
   * @param userData
   * @returns {Promise<IResult>}
   */
  public async createUser(userData: Partial<IUserDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newUser = await this.model.create(userData);
    result.data = newUser;
    result.message = "User created successfully";

    return result;
  }

  /**
   * @name deleteUser
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteUser(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedUser = await this.model.findByIdAndDelete(id);
    if (!deletedUser) {
      result.error = true;
      result.code = 404;
      result.message = "User not found";
    } else {
      result.message = "User deleted successfully";
      result.data = deletedUser;
    }

    return result;
  }

  /**
   * @name updateUser
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateUser(id: string, updateData: Partial<IUserDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedUser = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      result.error = true;
      result.code = 404;
      result.message = "User not found";
    } else {
      result.message = "User updated successfully";
      result.data = updatedUser;
    }

    return result;
  }

  /**
   * @name getAuthToken
   * @param user
   * @returns {Promise<IResult>}
   */
  public async getAuthToken(user: IUserDoc): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const tokenResult = await tokenService.attachToken(user);
    if (tokenResult.error) {
      result.error = true;
      result.code = 500;
      result.message = tokenResult.message;
    } else {
      result.message = "Token generated successfully";
      result.data = { token: tokenResult.data.token };
    }

    return result;
  }

  /**
     * @name findUserBySocialId
     * @param provider The social provider ('google', 'github', 'apple').
     * @param socialId The unique ID provided by the social service.
     * @returns {Promise<IUserDoc | null>} The user document if found.
     * @description Finds a user by checking the provider-specific ID field (e.g., googleId, githubId).
     */
  public async findUserBySocialId(
    provider: OAuthProvider,
    socialId: string
  ): Promise<IUserDoc | null> {

    const idField = `${provider}Id`;
    // Create the query object dynamically: { googleId: '12345' }
    const query = { [idField]: socialId };

    // Return the user document, or null if not found
    return await this.model.findOne(query);
  }
}

export default new UserRepository();
