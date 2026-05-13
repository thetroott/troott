import {
    FilterQuery,
    Model,
    Document,
    PopulateOptions,
    UpdateQuery,
} from 'mongoose';
import mongoose from 'mongoose';
import { IResult, IPagination } from '@/interfaces/common.interface';

/**
 * Query options interface
 */
interface QueryOptions {
    select?: string;
    sort?: string;
    page?: number;
    limit?: number;
    populate?: string | PopulateOptions | (string | PopulateOptions)[];
    // Query middleware features
    gt?: any;
    gte?: any;
    lt?: any;
    lte?: any;
    in?: any;
}

/**
 * Generic Repository Service
 * Provides common CRUD operations that can be reused across all models
 */
class RepositoryService<T extends Document> {
    protected model: Model<T>;
    protected modelName: string;

    constructor(model: Model<T>, modelName: string) {
        this.model = model;
        this.modelName = modelName;
    }

    /**
     * @name processFilter
     * @description Process filter query similar to query middleware
     * @description Converts gt, gte, lt, lte, in to MongoDB operators
     */
    private processFilter(
        filter: FilterQuery<T> & QueryOptions,
    ): FilterQuery<T> {
        const processedFilter = { ...filter };

        // Remove query options from filter
        delete (processedFilter as any).select;
        delete (processedFilter as any).sort;
        delete (processedFilter as any).page;
        delete (processedFilter as any).limit;
        delete (processedFilter as any).populate;
        delete (processedFilter as any).gt;
        delete (processedFilter as any).gte;
        delete (processedFilter as any).lt;
        delete (processedFilter as any).lte;
        delete (processedFilter as any).in;

        // Convert filter to string and process operators (like query middleware)
        let queryStr = JSON.stringify(processedFilter);
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`,
        );

        return JSON.parse(queryStr);
    }

    /**
     * @name findById
     * @param id - MongoDB ObjectId or string
     * @param populate - Array of populate paths or boolean
     * @returns Promise<IResult>
     * @description Find a document by ID and optionally populate related data
     */
    public async findById(
        id: string,
        populate:
            | boolean
            | string
            | Array<{ path: string }>
            | undefined = undefined,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const dataPop = Array.isArray(populate) ? populate : [];
            const shouldPopulate =
                typeof populate === 'boolean' ? populate : false;

            let query = this.model.findById(id);

            if (shouldPopulate && dataPop.length > 0) {
                query = query.populate(dataPop);
            } else if (shouldPopulate) {
                query = query.populate('');
            }

            const document = await query.lean();

            if (!document) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} found`;
                result.data = document;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name findByIdOrSlug
     * @description Find a document by either MongoDB ObjectId or slug (e.g. username).
     * @param input - The document ID (ObjectId or string) or slug
     * @param populate - Whether to populate related fields
     * @returns Promise<IResult>
     */
    public async findByIdOrSlug(
        input: string | number,
        populate:
            | boolean
            | string
            | Array<{ path: string }>
            | undefined = undefined,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            // normalize input to string to satisfy Mongoose ObjectId APIs
            const inputStr = String(input);

            const isObjectId =
                mongoose.Types.ObjectId.isValid(inputStr) &&
                new mongoose.Types.ObjectId(inputStr).toString() === inputStr;

            let query = isObjectId
                ? this.model.findById(inputStr)
                : this.model.findOne({ slug: inputStr } as FilterQuery<T>);

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
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} found`;
                result.data = document;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name findAll
     * @param filter - Optional filter query (can include query options)
     * @param options - Query options (select, sort, page, limit, populate)
     * @returns {Promise<IResult>}
     * @description Get all documents matching the filter with query middleware features (pagination, sorting, field selection)
     */
    public async findAll(
        filter: FilterQuery<T> & QueryOptions = {},
        options?: QueryOptions,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        // Merge filter and options
        const mergedOptions: QueryOptions = { ...filter, ...options };
        const { select, sort, page = 1, limit = 25, populate } = mergedOptions;

        // Process filter (remove options and process operators)
        const processedFilter = this.processFilter(filter);

        try {
            // Build query
            let query: any = this.model.find(processedFilter);

            // Select fields
            if (select) {
                const fields = select.split(',').join(' ');
                query = query.select(fields);
            }

            // Sort
            const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';
            query = query.sort(sortBy);

            // Pagination
            const pageNum = parseInt(String(page), 10) || 1;
            const limitNum = parseInt(String(limit), 10) || 25;
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = pageNum * limitNum;

            // Count total documents
            const total = await this.model.countDocuments(processedFilter);

            // Apply pagination
            query = query.skip(startIndex).limit(limitNum);

            // Populate
            if (populate) {
                if (typeof populate === 'string') {
                    query = query.populate(populate);
                } else if (Array.isArray(populate)) {
                    populate.forEach((pop) => {
                        if (typeof pop === 'string') {
                            query = query.populate(pop);
                        } else {
                            query = query.populate(pop);
                        }
                    });
                } else {
                    query = query.populate(populate);
                }
            }

            // Execute query
            const documents = await query.lean();

            // Build pagination object according to IPagination interface
            const pagination: IPagination = {
                total: total,
                count: documents.length,
                pagination: {
                    next:
                        endIndex < total
                            ? { page: pageNum + 1, limit: limitNum }
                            : { page: pageNum, limit: limitNum },
                    prev:
                        startIndex > 0
                            ? { page: pageNum - 1, limit: limitNum }
                            : { page: pageNum, limit: limitNum },
                },
                data: documents,
            };

            result.data = documents;
            result.pagination = pagination;
            result.message = `${this.modelName}s retrieved successfully`;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name findOne
     * @param filter - Filter query (can include query options)
     * @param options - Query options (select, populate)
     * @returns {Promise<IResult>}
     * @description Find a single document matching the filter with query middleware features (field selection)
     */
    public async findOne(
        filter: FilterQuery<T> & QueryOptions,
        options?: QueryOptions | boolean | Array<{ path: string }>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Handle backward compatibility: if options is boolean or array, treat as populate
        let populate:
            | boolean
            | Array<{ path: string }>
            | string
            | PopulateOptions
            | (string | PopulateOptions)[]
            | undefined;
        let select: string | undefined;

        if (typeof options === 'boolean') {
            populate = options;
        } else if (Array.isArray(options)) {
            populate = options;
        } else if (options) {
            populate = options.populate;
            select = options.select;
        }

        // Process filter (remove options and process operators)
        const processedFilter = this.processFilter(filter);

        try {
            let query: any = this.model.findOne(processedFilter);

            // Select fields
            if (select) {
                const fields = select.split(',').join(' ');
                query = query.select(fields);
            }

            // Populate
            if (populate) {
                if (typeof populate === 'boolean' && populate) {
                    query = query.populate('');
                } else if (Array.isArray(populate)) {
                    if (populate.length > 0) {
                        populate.forEach((pop) => {
                            if (typeof pop === 'object' && 'path' in pop) {
                                query = query.populate(pop);
                            }
                        });
                    } else {
                        query = query.populate('');
                    }
                } else if (typeof populate === 'string') {
                    query = query.populate(populate);
                } else {
                    query = query.populate(populate);
                }
            }

            const document = await query.lean();

            if (!document) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.data = document;
                result.message = `${this.modelName} found`;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name create
     * @param data - Document data to create
     * @returns {Promise<IResult>}
     * @description Create a new document
     */
    public async create(data: Partial<T> | any): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 201,
            data: {},
        };

        try {
            const newDocument = await this.model.create(data as any);
            result.data = newDocument;
            result.message = `${this.modelName} created successfully`;
        } catch (error: any) {
            result.error = true;
            result.code = 400;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name update
     * @param id - Document ID
     * @param updateData - Data to update
     * @returns {Promise<IResult>}
     * @description Update a document by ID
     */
    public async update(
        id: string,
        updateData: UpdateQuery<T> | Partial<T>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const updatedDocument = await this.model.findByIdAndUpdate(
                id,
                updateData,
                { new: true },
            );
            if (!updatedDocument) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} updated successfully`;
                result.data = updatedDocument;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name delete
     * @param id - Document ID
     * @returns {Promise<IResult>}
     * @description Delete a document by ID
     */
    public async delete(id: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const deletedDocument = await this.model.findByIdAndDelete(id);
            if (!deletedDocument) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} deleted successfully`;
                result.data = deletedDocument;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name updateMany
     * @param filter - Filter query to match documents to update
     * @param updateData - Data to update (can use MongoDB update operators like $set, $inc, etc.)
     * @returns {Promise<IResult>}
     * @description Update multiple documents matching the filter
     */
    public async updateMany(
        filter: FilterQuery<T>,
        updateData: UpdateQuery<T> | Partial<T>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            // Process filter to handle operators
            const processedFilter = this.processFilter(filter);

            const updateResult = await this.model.updateMany(
                processedFilter,
                updateData,
            );

            result.message = `${updateResult.modifiedCount} ${this.modelName}(s) updated successfully`;
            result.data = {
                matchedCount: updateResult.matchedCount,
                modifiedCount: updateResult.modifiedCount,
            };
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name deleteMany
     * @param filter - Filter query to match documents to delete
     * @returns {Promise<IResult>}
     * @description Delete multiple documents matching the filter
     */
    public async deleteMany(filter: FilterQuery<T>): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            // Process filter to handle operators
            const processedFilter = this.processFilter(filter);

            const deleteResult = await this.model.deleteMany(processedFilter);

            result.message = `${deleteResult.deletedCount} ${this.modelName}(s) deleted successfully`;
            result.data = {
                deletedCount: deleteResult.deletedCount,
            };
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name count
     * @param filter - Optional filter query
     * @returns {Promise<number>}
     * @description Count documents matching the filter
     */
    public async count(filter: FilterQuery<T> = {}): Promise<number> {
        try {
            return await this.model.countDocuments(filter);
        } catch (error) {
            return 0;
        }
    }

    /**
     * @name findByEmail
     * @param email - Email address to search for
     * @returns {Promise<IResult>}
     * @description Find a document by email address
     */
    public async findByEmail(email: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const document = await this.model
                .findOne({ email } as FilterQuery<T>)
                .lean();
            if (!document) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.data = document;
                result.message = `${this.modelName} found`;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name query
     * @description Advanced query method with pagination, filtering, sorting, and selecting
     * Similar to query middleware but integrated into the repository
     * @param filter - Filter query object
     * @param options - Query options (select, sort, page, limit, populate)
     * @returns Promise<IResult> with pagination info
     */
    public async query(
        filter: FilterQuery<T> = {},
        options: QueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        try {
            const { select, sort, page = 1, limit = 25, populate } = options;

            // Process filter
            const processedFilter = this.processFilter(filter);

            // Build query
            let query: any = this.model.find(processedFilter);

            // Select fields
            if (select) {
                const fields = select.split(',').join(' ');
                query = query.select(fields);
            }

            // Sort
            const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';
            query = query.sort(sortBy);

            // Pagination
            const pageNum = parseInt(String(page), 10) || 1;
            const limitNum = parseInt(String(limit), 10) || 25;
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = pageNum * limitNum;

            // Count total documents
            const total = await this.model.countDocuments(processedFilter);

            // Apply pagination
            query = query.skip(startIndex).limit(limitNum);

            // Populate
            if (populate) {
                if (typeof populate === 'string') {
                    query = query.populate(populate);
                } else if (Array.isArray(populate)) {
                    populate.forEach((pop) => {
                        if (typeof pop === 'string') {
                            query = query.populate(pop);
                        } else {
                            query = query.populate(pop);
                        }
                    });
                } else {
                    query = query.populate(populate);
                }
            }

            // Execute query
            const documents = await query.lean();

            // Build pagination object according to IPagination interface
            const pagination: IPagination = {
                total: total,
                count: documents.length,
                pagination: {
                    next:
                        endIndex < total
                            ? { page: pageNum + 1, limit: limitNum }
                            : { page: pageNum, limit: limitNum },
                    prev:
                        startIndex > 0
                            ? { page: pageNum - 1, limit: limitNum }
                            : { page: pageNum, limit: limitNum },
                },
                data: documents,
            };

            result.data = documents;
            result.pagination = pagination;
            result.message = `${this.modelName}s retrieved successfully`;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name pushToArray
     * @description Type-safe helper for pushing to array fields
     * @param id - Document ID
     * @param field - Array field name (e.g., 'members', 'tasks')
     * @param value - Value to push
     * @returns Promise<IResult>
     */
    public async pushToArray(
        id: string,
        field: string,
        value: any,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const updateQuery: any = {};
            updateQuery[`$push`] = {};
            updateQuery[`$push`][field] = value;

            const updatedDocument = await this.model.findByIdAndUpdate(
                id,
                updateQuery,
                { new: true },
            );

            if (!updatedDocument) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} updated successfully`;
                result.data = updatedDocument;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name pullFromArray
     * @description Type-safe helper for pulling from array fields
     * @param id - Document ID
     * @param field - Array field name (e.g., 'members', 'tasks')
     * @param value - Value to pull
     * @returns Promise<IResult>
     */
    public async pullFromArray(
        id: string,
        field: string,
        value: any,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const updateQuery: any = {};
            updateQuery[`$pull`] = {};
            updateQuery[`$pull`][field] = value;

            const updatedDocument = await this.model.findByIdAndUpdate(
                id,
                updateQuery,
                { new: true },
            );

            if (!updatedDocument) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} updated successfully`;
                result.data = updatedDocument;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name updateArrayElement
     * @description Type-safe helper for updating an element in an array
     * @param id - Document ID
     * @param field - Array field name
     * @param condition - Filter to match array element
     * @param value - New value for the matched element
     * @returns Promise<IResult>
     */
    public async updateArrayElement(
        id: string,
        field: string,
        condition: Record<string, any>,
        value: any,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const updateQuery: any = {};
            updateQuery[`$set`] = {};
            updateQuery[`$set`][`${field}.$`] = value;

            const updatedDocument = await this.model.findByIdAndUpdate(
                id,
                updateQuery,
                {
                    new: true,
                    arrayFilters: [condition],
                },
            );

            if (!updatedDocument) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} updated successfully`;
                result.data = updatedDocument;
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }
}

export default RepositoryService;
