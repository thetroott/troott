import { Model } from 'mongoose';
import Library from '@/models/core/library.model';
import { IResult, IQueryOptions } from '@/interfaces/common.interface';
import type { ILibraryDoc } from '@/interfaces/core/library.interface';
import { LibraryItemType } from '@/interfaces/core/library.interface';

class LibraryRepository {
    private model: Model<ILibraryDoc>;

    constructor() {
        this.model = Library;
    }

    public async createLibrary(
        libraryData: Partial<ILibraryDoc>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 201,
            data: {},
        };

        const existing = await this.model.findOne({
            listener: (libraryData as any).listener,
        });
        if (existing) {
            result.error = true;
            result.code = 400;
            result.message = 'Library already exists for this listener';
            return result;
        }

        const newLibrary = await this.model.create(libraryData);
        result.data = newLibrary;
        result.message = 'Library created successfully';
        return result;
    }

    public async findById(id: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const library = await this.model.findById(id);
        if (!library) {
            result.error = true;
            result.code = 404;
            result.message = 'Library not found';
        } else {
            result.data = library;
        }
        return result;
    }

    public async findByListener(listenerId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const library = await this.model.findOne({ listener: listenerId });
        if (!library) {
            result.error = true;
            result.code = 404;
            result.message = 'Library not found';
        } else {
            result.data = library;
        }
        return result;
    }

    public async findAll(
        filters = {},
        options: IQueryOptions = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const libraries = await this.model
            .find(filters)
            .sort(options.sort || '-createdAt')
            .skip(options.skip || 0)
            .limit(options.limit || 25);

        result.data = libraries;
        return result;
    }

    public async countDocuments(filters = {}): Promise<number> {
        return this.model.countDocuments(filters).exec();
    }

    public async pushItem(
        libraryId: string,
        item: any,
        countField: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const updated = await this.model.findByIdAndUpdate(
            libraryId,
            {
                $push: { items: item },
                $inc: { [countField]: 1, syncVersion: 1 },
                $set: { lastSyncedAt: new Date().toISOString() },
            },
            { new: true },
        );

        if (!updated) {
            result.error = true;
            result.code = 404;
            result.message = 'Library not found';
        } else {
            result.data = updated;
        }
        return result;
    }

    public async pullItem(
        libraryId: string,
        itemId: string,
        itemType: LibraryItemType,
        countField: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const updated = await this.model.findByIdAndUpdate(
            libraryId,
            {
                $pull: { items: { id: itemId, type: itemType } },
                $inc: { [countField]: -1, syncVersion: 1 },
                $set: { lastSyncedAt: new Date().toISOString() },
            },
            { new: true },
        );

        if (!updated) {
            result.error = true;
            result.code = 404;
            result.message = 'Library not found';
        } else {
            result.data = updated;
        }
        return result;
    }

    public async updateItemFlags(
        libraryId: string,
        itemId: string,
        itemType: LibraryItemType,
        flags: Partial<{
            liked: boolean;
            downloaded: boolean;
            pinned: boolean;
            favourite: boolean;
        }>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const setFields: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(flags)) {
            if (value !== undefined) {
                setFields[`items.$.flags.${key}`] = value;
            }
        }

        const updated = await this.model.findOneAndUpdate(
            {
                _id: libraryId,
                'items.id': itemId,
                'items.type': itemType,
            },
            {
                $set: setFields,
                $inc: { syncVersion: 1 },
            },
            { new: true },
        );

        if (!updated) {
            result.error = true;
            result.code = 404;
            result.message = 'Library or item not found';
        } else {
            result.data = updated;
        }
        return result;
    }

    public async updateLibrary(
        listenerId: string,
        updateData: Record<string, unknown>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const updated = await this.model.findOneAndUpdate(
            { listener: listenerId },
            { $set: updateData },
            { new: true },
        );

        if (!updated) {
            result.error = true;
            result.code = 404;
            result.message = 'Library not found';
        } else {
            result.data = updated;
            result.message = 'Library updated successfully';
        }
        return result;
    }

    public async deleteLibrary(listenerId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const deleted = await this.model.findOneAndDelete({
            listener: listenerId,
        });
        if (!deleted) {
            result.error = true;
            result.code = 404;
            result.message = 'Library not found';
        } else {
            result.message = 'Library deleted successfully';
            result.data = deleted;
        }
        return result;
    }
}

export default new LibraryRepository();
