import { dateToday, leadingNum, strIncludesEs6 } from '@btffamily/pacitude';
import { IPagination, ISearchQuery } from '@/interfaces/common.interface';

const defineRef = (ref?: string): string => {
    if (ref === 'id') {
        return '_id';
    } else if (ref) {
        return ref;
    } else {
        return '';
    }
};

const formatDateRange = (
    from?: string,
    to?: string,
): { start?: Date; end?: Date } => {
    const result: { start?: Date; end?: Date } = {};

    if (from) {
        const ts = dateToday(from.trim());

        result.start = new Date(
            `${ts.year}-${leadingNum(ts.month)}-${leadingNum(ts.date)}`,
        );
    }

    if (to) {
        const te = dateToday(to.trim());

        const end = new Date(
            `${te.year}-${leadingNum(te.month)}-${leadingNum(te.date)}`,
        );

        // Include the full "to" date
        end.setDate(end.getDate() + 1);

        result.end = end;
    }

    return result;
};

const buildFilter = (q: ISearchQuery): Record<string, any> => {
    const data = Array.isArray(q.data) ? [...q.data] : [];
    const query = Array.isArray(q.query) ? [...q.query] : [];

    const { start, end } = formatDateRange(
        q.queryParam?.from?.toString(),
        q.queryParam?.to?.toString(),
    );

    // Add createdAt filter
    if (start || end) {
        const createdAt: Record<string, Date> = {};

        if (start) {
            createdAt.$gte = start;
        }

        if (end) {
            createdAt.$lt = end;
        }

        data.push({ createdAt });
    }

    let filter: Record<string, any> = {};

    // Build filter based on operator
    if (q.operator === 'or') {
        if (data.length > 0) {
            filter = { $or: data };
        } else {
            filter = {};
        }
    } else if (q.operator === 'and') {
        if (data.length > 0) {
            filter = { $and: data };
        } else {
            filter = {};
        }
    } else if (q.operator === 'andor') {
        const andConditions: Array<any> = [];

        if (query.length > 0) {
            andConditions.push({ $or: query });
        }

        if (data.length > 0) {
            andConditions.push({ $or: data });
        }

        if (andConditions.length > 0) {
            filter = { $and: andConditions };
        } else {
            filter = {};
        }
    } else if (q.operator === 'orand') {
        const orConditions: Array<any> = [];

        if (query.length > 0) {
            orConditions.push({ $and: query });
        }

        if (data.length > 0) {
            orConditions.push({ $and: data });
        }

        if (orConditions.length > 0) {
            filter = { $or: orConditions };
        } else {
            filter = {};
        }
    } else {
        // Default behavior for "in" and no operator
        if (data.length === 0) {
            filter = {};
        } else if (data.length === 1) {
            filter = data[0];
        } else {
            filter = { $and: data };
        }
    }

    // Add ref/value filter
    if (
        q.ref !== undefined &&
        q.ref !== null &&
        q.ref !== '' &&
        q.value !== undefined &&
        q.value !== null
    ) {
        filter[defineRef(q.ref)] = q.value;
    }

    return filter;
};

const buildSelect = (q: ISearchQuery): string => {
    let fields = '';

    if (Array.isArray(q.fields) && q.fields.length > 0) {
        fields = q.fields
            .map((field) => {
                if (strIncludesEs6(field, '+')) {
                    return field;
                } else {
                    return `+${field}`;
                }
            })
            .join(' ');
    }

    if (q.queryParam?.select) {
        const selects = q.queryParam.select
            .toString()
            .split(',')
            .join(' ');

        if (fields) {
            fields = `${fields} ${selects}`.trim();
        } else {
            fields = selects;
        }
    }

    return fields;
};

const buildSort = (q: ISearchQuery): Record<string, 1 | -1> => {
    let order: 1 | -1 = -1;

    if (q.queryParam?.order?.toString() === 'asc') {
        order = 1;
    } else {
        order = -1;
    }

    const sort: Record<string, 1 | -1> = {};

    if (q.queryParam?.sort) {
        const fields = q.queryParam.sort
            .toString()
            .split(',')
            .filter((field: string) => field.trim() !== '');

        if (fields.length > 0) {
            fields.forEach((field: string) => {
                sort[field] = order;
            });
        }
    }

    if (Object.keys(sort).length === 0) {
        sort.createdAt = order;
    }

    return sort;
};

const buildPagination = (q: ISearchQuery) => {
    let page = 1;
    let limit = 50;

    const parsedPage = parseInt(
        q.queryParam?.page?.toString() || '1',
        10,
    );

    const parsedLimit = parseInt(
        q.queryParam?.limit?.toString() || '50',
        10,
    );

    if (!Number.isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
    }

    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
        if (parsedLimit > 100) {
            limit = 100;
        } else {
            limit = parsedLimit;
        }
    }

    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
    };
};

export const search = async (
    q: ISearchQuery,
): Promise<IPagination> => {
    const filter = buildFilter(q);
    const select = buildSelect(q);
    const sort = buildSort(q);
    const { page, limit, skip } = buildPagination(q);

    let query = q.model.find(filter);

    if (select) {
        query = query.select(select);
    }

    query = query.sort(sort);
    query = query.skip(skip);
    query = query.limit(limit);

    if (q.populate) {
        query = query.populate(q.populate);
    }

    const [results, total] = await Promise.all([
        query.exec(),
        q.model.countDocuments(filter),
    ]);

    const pagination: IPagination['pagination'] = {};
    const totalPages = Math.ceil(total / limit);

    if (page < totalPages) {
        pagination.next = {
            page: page + 1,
            limit,
        };
    }

    if (page > 1) {
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    return {
        total,
        count: results.length,
        pagination,
        data: results,
    };
};