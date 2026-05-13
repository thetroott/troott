import { FilterQuery, UpdateQuery } from 'mongoose';
import Admin from '@/models/admin.model';
import { IAdminDoc } from '@/interfaces/admin.interface';
import RepositoryService from '@/services/repository.service';
import { IResult } from '@/interfaces/common.interface';

/**
 * Admin Repository
 * Extends the generic repository with admin-specific methods
 */
class AdminRepository extends RepositoryService<IAdminDoc> {
    constructor() {
        super(Admin, 'Admin');
    }

    /**
     * @name findAdmin
     * @description Find an admin by either MongoDB ObjectId or slug
     * @param input - The admin ID (ObjectId or string) or slug
     * @param populate - Whether to populate related fields
     * @returns Promise<IResult>
     */
    public async findAdmin(
        input: string | number,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    /**
     * @name getAdmins
     * @param filter - Optional filter query
     * @param options - Query options (select, sort, page, limit, populate)
     * @returns {Promise<IResult>}
     * @description Get all admins with query middleware features (pagination, sorting, field selection)
     */
    public async getAdmins(
        filter?: FilterQuery<IAdminDoc>,
        options?: {
            select?: string;
            sort?: string;
            page?: number;
            limit?: number;
            populate?: string | any;
        },
    ): Promise<IResult> {
        if (options) {
            return this.findAll(filter || {}, options as any);
        }
        return this.findAll(filter);
    }

    /**
     * @name createAdmin
     * @param adminData
     * @returns {Promise<IResult>}
     * @description Create a new admin
     */
    public async createAdmin(adminData: Partial<IAdminDoc>): Promise<IResult> {
        return this.create(adminData);
    }

    /**
     * @name updateAdmin
     * @param id
     * @param updateData
     * @returns {Promise<IResult>}
     * @description Update an admin
     */
    public async updateAdmin(
        id: string,
        updateData: UpdateQuery<IAdminDoc> | Partial<IAdminDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData);
    }

    /**
     * @name deleteAdmin
     * @param id
     * @returns {Promise<IResult>}
     * @description Delete an admin
     */
    public async deleteAdmin(id: string): Promise<IResult> {
        return this.delete(id);
    }

    /**
     * @name findAdminByUser
     * @description Find an admin by user ID
     * @param userId - The user ID
     * @param populate - Whether to populate related fields
     * @returns Promise<IResult>
     */
    public async findAdminByUser(
        userId: string,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            let query = this.model.findOne({ user: userId });

            if (populate) {
                const dataPop = Array.isArray(populate) ? populate : [];
                if (dataPop.length > 0) {
                    query = query.populate(dataPop);
                } else {
                    query = query.populate('');
                }
            }

            const document = await query.lean();

            if (!document) {
                result.error = true;
                result.code = 404;
                result.message = 'Admin not found';
            } else {
                result.message = 'Admin found';
                result.data = document;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    // [MIGRATION-REVIEW] Methods merged from flat repositories/admin.repository.ts

    public async findByEmail(email: string): Promise<IResult> {
        return this.findOne({ email });
    }

    public async getAllAdmins(): Promise<IResult> {
        return this.findAll({});
    }

    public async getStaffByRole(role: string): Promise<IResult> {
        return this.findAll({ role } as any);
    }

    public async getStaffByUnit(unit: string): Promise<IResult> {
        return this.findAll({ unit } as any);
    }

    public async updateVerificationStatus(
        id: string,
        status: string,
    ): Promise<IResult> {
        return this.update(id, {
            verificationStatus: status,
            isVerified: status === 'VERIFIED',
        } as any);
    }
}

export default new AdminRepository();
