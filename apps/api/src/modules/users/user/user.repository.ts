import { FilterQuery } from 'mongoose';
import User from './user.model';
import { IUserDoc } from './user.interface';
import RepositoryService from '../../../services/repository.service';
import { IResult } from '../../../utils/interfaces.util';
import tokenService from '../../../services/token.service';

/**
 * User Repository
 * Extends the generic repository with user-specific methods
 * Caching is handled at the service/controller layer, not here
 */
class UserRepository extends RepositoryService<IUserDoc> {
    constructor() {
        super(User, 'User');
    }

    /**
     * @name findUser
     * @description Find a user by either MongoDB ObjectId or slug (e.g. username).
     * @param input - The user ID (ObjectId or string) or username slug
     * @param populate - Whether to populate related fields (e.g. events)
     * @returns Promise<IResult>
     */
    public async findUser(
        input: string | number,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    /**
     * @name getUsers
     * @param filter - Optional filter query
     * @param options - Query options (select, sort, page, limit, populate)
     * @returns {Promise<IResult>}
     * @description Get all users with query middleware features (pagination, sorting, field selection)
     */
    public async getUsers(
        filter?: FilterQuery<IUserDoc>,
        options?: {
            select?: string;
            sort?: string;
            page?: number;
            limit?: number;
            populate?: string | any;
        },
    ): Promise<IResult> {
        if (options) {
            return this.findAll(filter || {}, options);
        }
        return this.findAll(filter);
    }

    /**
     * @name createUser
     * @param userData
     * @returns {Promise<IResult>}
     * @description Create a new user
     */
    public async createUser(userData: Partial<IUserDoc>): Promise<IResult> {
        return this.create(userData);
    }

    /**
     * @name updateUser
     * @param id
     * @param updateData
     * @returns {Promise<IResult>}
     * @description Update a user
     */
    public async updateUser(
        id: string,
        updateData: Partial<IUserDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData);
    }

    /**
     * @name deleteUser
     * @param id
     * @returns {Promise<IResult>}
     * @description Delete a user
     */
    public async deleteUser(id: string): Promise<IResult> {
        return this.delete(id);
    }

    /**
     * @name getAuthToken
     * @param user
     * @returns {Promise<IResult>}
     * @description Generate authentication token for a user
     */
    public async getAuthToken(user: IUserDoc): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const tokenResult = await tokenService.attachToken(user);
        if (tokenResult.error) {
            result.error = true;
            result.code = 500;
            result.message = tokenResult.message;
        } else {
            result.message = 'Token generated successfully';
            result.data = { token: tokenResult.data.token };
        }

        return result;
    }
}

export default new UserRepository();
