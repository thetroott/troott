import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import type { IListenerDoc } from '../../src/interfaces/core/listener.interface';
import type { IUserDoc } from '../../src/interfaces/user.interface';
import { UserType } from '../../src/interfaces/user.interface';
import { createUser } from './user.factory';

export interface ListenerFactoryOptions {
    user?: IUserDoc;
    email?: string;
    slug?: string;
}

export const createListenerData = (
    options: ListenerFactoryOptions = {},
): Partial<IListenerDoc> => {
    return {
        code: `LST-${faker.string.alphanumeric(8)}`,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: options.email || faker.internet.email().toLowerCase(),
        slug: options.slug || faker.internet.username().toLowerCase(),
        onboarding: { step: 0, status: 'not_started' },
        topics: [],
        ministers: [],
        likedSermons: [],
        LikedSeries: [],
        sharedSermons: [],
        recentlyPlayed: [],
        listeningHistory: [],
        following: [],
        followers: [],
        interests: [],
        viewedSermonBites: [],
        sharedSermonBites: [],
        savedSermonBites: [],
        badges: [],
        subscriptions: [],
        playlists: [],
        transactions: [],
        recentSearches: [],
        user: options.user?._id || new Types.ObjectId(),
    };
};

export const createListenerWithUser = async (
    options: ListenerFactoryOptions = {},
): Promise<{ user: IUserDoc; listenerData: Partial<IListenerDoc> }> => {
    const user =
        options.user ||
        (await createUser({ userType: UserType.LISTENER }));
    const listenerData = createListenerData({
        ...options,
        user,
        email: user.email,
    });
    return { user, listenerData };
};
