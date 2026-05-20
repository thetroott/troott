import { createContext } from 'react';

import type { IUserContextValue } from './types';

const UserContext = createContext<IUserContextValue | null>(null);

export default UserContext;
