import { createContext } from 'react';

import type { IAuthContextValue } from './types';

const AuthContext = createContext<IAuthContextValue | null>(null);

export default AuthContext;
