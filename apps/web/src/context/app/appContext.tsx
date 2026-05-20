import { createContext } from 'react';

import type { IAppContext } from './types';

const AppContext = createContext<IAppContext | null>(null);

export default AppContext;
