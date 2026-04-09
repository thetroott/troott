import mongoose from 'mongoose';
import { FilterQuery, UpdateQuery } from 'mongoose';
import Role from './role.model';
import { IRoleDoc } from './role.interface';
import RepositoryService from '../../../services/repository.service';
import { IResult } from '../../../utils/interfaces.util';

/**
 * Role Repository
 * Extends the generic repository with role-specific methods
 * Caching is handled at the service/controller layer, not here
 */
class RoleRepository extends RepositoryService<IRoleDoc> {
    constructor() {
        super(Role, 'Role');
    }

    /**
     * @name findRole
     * @description Find a role by either MongoDB ObjectId or slug
     * @param input - The role ID (ObjectId or string) or slug
     * @param populate - Whether to populate related fields
     * @returns Promise<IResult>
     */
    public async findRole(
        input: string | number,
        populate:
            | boolean
            | string
            | Array<{ path: string }>
            | undefined = undefined,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    /**
     * @name findByName
     * @description Find a role by name
     * @param name - Role name
     * @returns Promise<IResult>
     */
    public async findByName(name: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const role = await Role.findOne({ name: name });
            if (!role) {
                result.error = true;
                result.code = 404;
                result.message = 'Role not found';
                return result;
            }
            result.data = role;
            result.message = 'Role found';
            return result;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
            return result;
        }
    }

    /**
     * @name getRoles
     * @param filter - Optional filter query
     * @param options - Query options (select, sort, page, limit, populate)
     * @returns {Promise<IResult>}
     * @description Get all roles with query middleware features (pagination, sorting, field selection)
     */
    public async getRoles(
        filter?: FilterQuery<IRoleDoc>,
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
     * @name createRole
     * @param roleData
     * @returns {Promise<IResult>}
     * @description Create a new role
     */
    public async createRole(
        roleData: Partial<IRoleDoc>,
    ): Promise<IResult> {
        return this.create(roleData);
    }

    /**
     * @name updateRole
     * @param id
     * @param updateData
     * @returns {Promise<IResult>}
     * @description Update a role
     */
    public async updateRole(
        id: string,
        updateData:
            | UpdateQuery<IRoleDoc>
            | Partial<IRoleDoc>
            | mongoose.UpdateQuery<IRoleDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData as any);
    }

    /**
     * @name deleteRole
     * @param id
     * @returns {Promise<IResult>}
     * @description Delete a role
     */
    public async deleteRole(id: string): Promise<IResult> {
        return this.delete(id);
    }
}

export default new RoleRepository();
